#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
VulnLab 크롤러 (Requests 버전, ref(URLs) 추출 보강)
- ID 범위: --start N --end M
- 저장 폴더: --out DIR (기본: data/vulnlab_json)
- 타임아웃/지연/UA 조절 가능
"""

import os
import re
import json
import time
import uuid
import hashlib
import argparse
from typing import Optional

import requests

# --- 버전/식별 ---
GENERATOR_NAME = "vuln_parser_requests"
GENERATOR_VERSION = "2025-08-19-req-ref-v2"

# --- 네트워크 기본값 ---
UA_DEFAULT = "Mozilla/5.0 (X11; Linux x86_64) BlackWatch/1.0"
TIMEOUT_DEFAULT = 15
DELAY_DEFAULT = 1.2

# --- 섹션 라벨 정의 ---
LABELS = {
    "Document Title": r"Document\s*Title",
    "Release Date": r"Release\s*Date",
    "Common Vulnerability Scoring System": r"(?:Common\s+Vulnerability\s+Scoring\s+System|CVSS)",
    "Vulnerability Class": r"Vulnerability\s*Class",
    "Affected Product(s)": r"Affected\s+Product\(s\)|Affected\s+Products?",
    "Exploitation Technique": r"Exploitation\s*Technique",
    "Proof of Concept (PoC)": r"Proof\s+of\s+Concept\s*\(PoC\)|^PoC$",
    "CVE": r"CVE(?:\s*ID)?s?",
    "References": r"References(?:\s*\(Source\))?",
}
LABEL_REGEXES = {k: re.compile(v, re.IGNORECASE) for k, v in LABELS.items()}

# --- PoC 끝나는 지점 ---
STOP_PATTERN = re.compile(
    r'(?:\n(?:'
    r'Security\s*Risk'
    r'|Credits\s*&\s*Authors'
    r'|Disclaimer\s*&\s*Information'
    r'|Domains'
    r'|References(?:\s*\(Source\))?'
    r'|Copyright'
    r'))\s*:?'
    , flags=re.IGNORECASE
)

# -------------------------
# 유틸
# -------------------------
def safe_strip(s):
    return s.strip() if isinstance(s, str) else "None"

def parse_cvss_score(raw):
    if not raw:
        return "None"
    m = re.search(r"(\d+(?:\.\d+)?)", raw)
    try:
        return float(m.group(1)) if m else "None"
    except Exception:
        return "None"

def parse_array(raw):
    if not raw:
        return ["None"]
    parts = re.split(r"[,;\n]+", raw)
    result = [p.strip() for p in parts if p.strip()]
    return result if result else ["None"]

def try_parse_date(text):
    if not text:
        return "None"
    m = re.search(r"(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})", text)
    if m:
        y, mo, d = m.groups()
        try:
            return f"{int(y):04d}-{int(mo):02d}-{int(d):02d}"
        except Exception:
            pass
    try:
        from dateutil import parser as dtp
        return dtp.parse(text, dayfirst=False, fuzzy=True).date().isoformat()
    except Exception:
        return safe_strip(text) or "None"

def is_separator_line(line: str) -> bool:
    s = line.strip()
    return bool(s) and set(s) == {"="}

def is_heading(lines, idx: int) -> bool:
    return idx < len(lines)-1 and lines[idx].strip().endswith(":") and is_separator_line(lines[idx+1])

def parse_sections_with_headings(text: str) -> dict:
    lines = text.splitlines()
    n = len(lines)
    results = {k: None for k in LABELS.keys()}
    current_key = None
    buffer = []
    i = 0

    def flush():
        nonlocal buffer, current_key
        if current_key is not None:
            cleaned = []
            for b in buffer:
                if is_separator_line(b):
                    cleaned.clear()
                    continue
                cleaned.append(b)
            value = "\n".join(cleaned) if cleaned else "None"
            if results[current_key] is None:
                results[current_key] = value
        buffer = []
        current_key = None

    while i < n:
        line = lines[i]
        if current_key is not None and is_heading(lines, i):
            flush()
            continue

        matched_key = None
        if is_heading(lines, i) or line.strip().endswith(":"):
            for key, rx in LABEL_REGEXES.items():
                raw = line.strip().rstrip(":")
                if rx.fullmatch(raw) or rx.search(line):
                    matched_key = key
                    break

        if matched_key is not None and is_heading(lines, i):
            current_key = matched_key
            buffer = []
            i += 2
            continue
        elif matched_key is not None and line.strip().endswith(":"):
            current_key = matched_key
            buffer = []
            i += 1
            continue

        if current_key is not None:
            buffer.append(line)

        i += 1

    flush()
    return results

def trim_after_poc(content: str) -> str:
    if not content:
        return "None"
    parts = STOP_PATTERN.split(content, maxsplit=1)
    return parts[0].rstrip() if parts else "None"

# --- URL 추출 정규식(보강) ---
def parse_urls(raw: str):
    """
    텍스트에서 URL만 뽑아 배열로 반환. 없으면 ["None"].
    - 괄호/대괄호/따옴표에 붙은 꼬리 문자까지 정리
    - 순서 보존 중복 제거
    """
    if not raw:
        return ["None"]

    # 공백/큰따옴표/괄호/대괄호/꺽쇠 전에 끊음
    url_rx = re.compile(r'(?i)\bhttps?://[^\s<>"\)\]\}]+' )
    urls = url_rx.findall(raw)

    cleaned = []
    for u in urls:
        u = re.sub(r'[),.;:\]\}]+$', '', u)  # 꼬리 정리
        cleaned.append(u)

    seen = set(); out = []
    for u in cleaned:
        if u not in seen:
            seen.add(u); out.append(u)

    return out if out else ["None"]

# --- References 블록 폴백 추출 ---
def extract_references_block_fallback(full_text: str) -> Optional[str]:
    """
    parse_sections가 못 잡았을 때 대비해 전체 텍스트에서
    'References' 블록을 직접 추출한다.
    - 'References' 라인(선택적 '(Source)') 다음의 ====== 밑줄 허용
    - 다음 헤딩(Release Date, Document Title 등) 이전까지만 캡처
    """
    if not full_text:
        return None

    block_rx = re.compile(
        r'(?ims)'                                  # multi-line, dot-all, case-insens
        r'^\s*References(?:\s*\(Source\))?\s*:?\s*\n'  # 헤딩 라인
        r'(?:=+\s*\n)?'                            # 밑줄 허용
        r'(.*?)'                                   # 본문 (non-greedy)
        r'(?=\n\s*(?:Release\s*Date|Document\s*Title|Vulnerability\s+Class|'
        r'Affected\s+Product|Exploitation\s*Technique|Common\s+Vulnerability|'
        r'Credits|Security\s*Risk|Disclaimer|Copyright)\b)',
    )
    m = block_rx.search(full_text)
    return m.group(1).strip() if m else None

# -------------------------
# 본 처리
# -------------------------
def fetch_text(vid: int, ua: str, timeout: int) -> Optional[str]:
    url = f"https://www.vulnerability-lab.com/get_content.php?id={vid}"
    print(f"[+] {url}")
    try:
        r = requests.get(url, headers={"User-Agent": ua}, timeout=timeout)
        if r.status_code != 200:
            print(f"[!] {vid} HTTP {r.status_code}")
            return None
        text = r.text or ""
        if not text.strip():
            print(f"[!] {vid} 빈 본문")
            return None
        return text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", "    ")
    except Exception as e:
        print(f"[!] {vid} 요청 에러: {e}")
        return None

def build_item(vid: int, full_text: str, client_id: str) -> dict:
    sections = parse_sections_with_headings(full_text)

    title_raw   = sections.get("Document Title")
    date_raw    = sections.get("Release Date")
    cvss_raw    = sections.get("Common Vulnerability Scoring System")
    class_raw   = sections.get("Vulnerability Class")
    prod_raw    = sections.get("Affected Product(s)")
    exploit_raw = sections.get("Exploitation Technique")
    poc_raw     = sections.get("Proof of Concept (PoC)")
    cve_raw     = sections.get("CVE")
    ref_raw     = sections.get("References")

    # parse_sections가 못 잡았으면 폴백
    if not ref_raw or ref_raw == "None":
        fb = extract_references_block_fallback(full_text)
        if fb:
            ref_raw = fb

    poc_string = trim_after_poc(poc_raw)

    item = {
        "generator": {"name": GENERATOR_NAME, "version": GENERATOR_VERSION},
        "clientId": client_id,
        "host": "www.vulnerability-lab.com",
        "path": f"/get_content.php?id={vid}",
        "title": safe_strip(title_raw) or "None",
        "author": "None",
        "uploadDate": try_parse_date(date_raw) or "None",
        "ref": parse_urls(ref_raw),
        "cveIds": parse_array(cve_raw),
        "cvss": parse_cvss_score(cvss_raw),
        "vulnerability_class": parse_array(class_raw),
        "affected_products": parse_array(prod_raw),
        "exploitation_technique": parse_array(exploit_raw),
        "article": poc_string,
    }

    key_material = "|".join([
        item.get("title", "None"),
        item.get("uploadDate", "None"),
        str(item.get("cvss", "None")),
        ",".join(item.get("vulnerability_class", ["None"])),
        ",".join(item.get("exploitation_technique", ["None"])),
        item.get("article", "None"),
        ",".join(item.get("ref", ["None"])),
    ])
    item["dedup_hash"] = hashlib.sha256(key_material.encode("utf-8")).hexdigest()
    return item

def crawl_vulnlab(start_id: int, end_id: int, out_dir: str, ua: str, timeout: int, delay: float):
    os.makedirs(out_dir, exist_ok=True)
    client_id = str(uuid.uuid4())

    for vid in range(start_id, end_id + 1):
        full_text = fetch_text(vid, ua=ua, timeout=timeout)
        if not full_text:
            continue

        item = build_item(vid, full_text, client_id=client_id)

        out_path = os.path.join(out_dir, f"{vid}.json")
        try:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(item, f, ensure_ascii=False, indent=2)
            print(f"[v] {vid} 저장 완료 → {out_path}")
        except Exception as e:
            print(f"[!] {vid} 저장 실패: {e}")

        time.sleep(delay)

# -------------------------
# CLI
# -------------------------
def main():
    ap = argparse.ArgumentParser(description="VulnLab requests-based crawler (with ref extraction)")
    ap.add_argument("--start", type=int, required=True)
    ap.add_argument("--end", type=int, required=True)
    ap.add_argument("--out", type=str, default="data/vulnlab_json")
    ap.add_argument("--ua", type=str, default=UA_DEFAULT)
    ap.add_argument("--timeout", type=int, default=TIMEOUT_DEFAULT)
    ap.add_argument("--delay", type=float, default=DELAY_DEFAULT)

    args = ap.parse_args()

    print(f"[GEN] {GENERATOR_NAME} {GENERATOR_VERSION}")
    crawl_vulnlab(args.start, args.end, args.out, ua=args.ua, timeout=args.timeout, delay=args.delay)

if __name__ == "__main__":
    main()

