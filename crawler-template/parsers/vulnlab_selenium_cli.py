#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VulnLab Selenium Parser (CLI) - profileless
- user-data-dir(프로필) 미사용 → 'user data directory is already in use' 회피
- webdriver-manager로 크롬드라이버 자동 매칭 설치
- 기본 저장 경로: data/vulnlab_json
- 인자: --start, --end, --out, --sleep, --no-headless
"""

import os
import re
import json
import time
import uuid
import hashlib
import argparse
from typing import Dict, Any

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


# ===== 유틸 =====
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


def parse_urls(raw):
    """References 섹션에서 URL만 추출하여 배열로 반환. 없으면 ['None']"""
    if not raw:
        return ["None"]
    url_rx = re.compile(r'(https?://[^\s\]\)<>"]+)', re.IGNORECASE)
    urls = url_rx.findall(raw)
    cleaned = [u.rstrip('.,;:)') for u in urls]
    seen, deduped = set(), []
    for u in cleaned:
        if u not in seen:
            seen.add(u)
            deduped.append(u)
    return deduped if deduped else ["None"]


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


LABELS = {
    "Document Title": r"Document\s*Title",
    "Release Date": r"Release\s*Date",
    "Common Vulnerability Scoring System": r"Common\s+Vulnerability\s+Scoring\s+System|CVSS",
    "Vulnerability Class": r"Vulnerability\s*Class",
    "Affected Product(s)": r"Affected\s+Product\(s\)|Affected\s+Products?",
    "Exploitation Technique": r"Exploitation\s*Technique",
    "Proof of Concept (PoC)": r"Proof\s+of\s+Concept\s*\(PoC\)|^PoC$",
    "CVE": r"CVE(?:\s*ID)?s?",
    "References": r"References(?:\s*\(Source\))?",
}
LABEL_REGEXES = {k: re.compile(v, re.IGNORECASE) for k, v in LABELS.items()}


def is_separator_line(line: str) -> bool:
    s = line.strip()
    return bool(s) and set(s) == {"="}


def is_heading(lines, idx: int) -> bool:
    return idx < len(lines) - 1 and lines[idx].strip().endswith(":") and is_separator_line(lines[idx + 1])


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
        buffer.clear()

    while i < n:
        line = lines[i]
        if current_key is not None and is_heading(lines, i):
            flush()
            current_key = None
        matched_key = None
        if is_heading(lines, i) or line.strip().endswith(":"):
            for key, rx in LABEL_REGEXES.items():
                if rx.fullmatch(line.strip().rstrip(":")) or rx.search(line):
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

    if current_key is not None:
        flush()
    return results


STOP_PATTERN = re.compile(
    r'(?:\n(?:'
    r'Security\s*Risk'
    r'|Credits\s*&\s*Authors'
    r'|Disclaimer\s*&\s*Information'
    r'|Domains'
    r'|References(?:\s*\(Source\))?'
    r'|Copyright'
    r'))\s*:?',
    flags=re.IGNORECASE,
)


def trim_after_poc(content: str) -> str:
    if not content:
        return "None"
    parts = STOP_PATTERN.split(content, maxsplit=1)
    return parts[0].rstrip() if parts else "None"


def build_item(client_id: str, vuln_id: int, sections: dict) -> Dict[str, Any]:
    title_raw = sections.get("Document Title")
    date_raw = sections.get("Release Date")
    cvss_raw = sections.get("Common Vulnerability Scoring System")
    class_raw = sections.get("Vulnerability Class")
    prod_raw = sections.get("Affected Product(s)")
    exploit_raw = sections.get("Exploitation Technique")
    poc_raw = sections.get("Proof of Concept (PoC)")
    cve_raw = sections.get("CVE")
    ref_raw = sections.get("References")

    poc_string = trim_after_poc(poc_raw)
    item = {
        "clientId": client_id,
        "host": "www.vulnerability-lab.com",
        "path": f"/get_content.php?id={vuln_id}",
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
    key_material = "|".join(
        [
            item.get("title", "None"),
            item.get("uploadDate", "None"),
            str(item.get("cvss", "None")),
            ",".join(item.get("vulnerability_class", ["None"])),
            ",".join(item.get("exploitation_technique", ["None"])),
            item.get("article", "None"),
            ",".join(item.get("ref", ["None"])),
        ]
    )
    item["dedup_hash"] = hashlib.sha256(key_material.encode("utf-8")).hexdigest()
    return item


def run(start_id: int, end_id: int, out_dir: str, sleep_sec: float, headless: bool = True) -> int:
    os.makedirs(out_dir, exist_ok=True)

    # --- Selenium/Chrome 옵션 (프로필 미사용) ---
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-features=Translate,AutomationControlled")
    options.add_argument("--remote-debugging-port=0")
    options.add_argument("user-agent=Mozilla/5.0")
    # ------------------------------------------------

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    client_id = str(uuid.uuid4())
    ok = 0

    try:
        for vuln_id in range(start_id, end_id + 1):
            url = f"https://www.vulnerability-lab.com/get_content.php?id={vuln_id}"
            print(f"[+] {url} 접속 중...")

            try:
                driver.get(url)
                time.sleep(sleep_sec)
                body_el = driver.find_element(By.TAG_NAME, "body")
                text = (body_el.text or "")
                if not text or "not found" in text.lower():
                    print(f"[!] ID {vuln_id} - 본문 없음/404 가능")
                    continue

                text_norm = text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", "    ")
                sections = parse_sections_with_headings(text_norm)
                item = build_item(client_id, vuln_id, sections)

                out_path = os.path.join(out_dir, f"{vuln_id}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(item, f, ensure_ascii=False, indent=2)
                print(f"[✓] ID {vuln_id} → {out_path}")
                ok += 1

            except Exception as e:
                print(f"[!] ID {vuln_id} 에러: {e}")

    finally:
        driver.quit()

    print(f"[DONE] saved {ok} / {end_id - start_id + 1}")
    return ok


def main():
    ap = argparse.ArgumentParser(description="VulnLab Selenium Parser (CLI)")
    ap.add_argument("--start", type=int, default=2310)
    ap.add_argument("--end", type=int, default=2314)
    ap.add_argument("--out", type=str, default=os.path.join("data", "vulnlab_json"))
    ap.add_argument("--sleep", type=float, default=2.5, help="페이지 로딩 대기(초)")
    ap.add_argument("--no-headless", action="store_true", help="헤드리스 끄기(디버깅용)")
    args = ap.parse_args()

    run(
        start_id=args.start,
        end_id=args.end,
        out_dir=args.out,
        sleep_sec=args.sleep,
        headless=not args.no_headless,
    )


if __name__ == "__main__":
    main()
