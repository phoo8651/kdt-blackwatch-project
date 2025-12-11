import os
import re
import json
import time
import hashlib
import uuid
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# ===== 설정 =====
START_ID = 2310
END_ID = 2314
SAVE_DIR = "vulnlab_json"
os.makedirs(SAVE_DIR, exist_ok=True)

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
    """
    References 섹션에서 URL만 뽑아 배열로 반환.
    URL이 없으면 ["None"] 반환.
    """
    if not raw:
        return ["None"]
    # URL 패턴 추출
    url_rx = re.compile(r'(https?://[^\s\]\)<>"]+)', re.IGNORECASE)
    urls = url_rx.findall(raw)

    # 끝에 붙은 문장부호 정리
    cleaned = []
    for u in urls:
        cleaned.append(u.rstrip('.,;:)'))

    # 순서 보존 중복 제거
    seen = set()
    deduped = []
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
    "References": r"References(?:\s*\(Source\))?"   # ✅ References 추가
}
LABEL_REGEXES = {k: re.compile(v, re.IGNORECASE) for k, v in LABELS.items()}

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

    flush()
    return results

STOP_PATTERN = re.compile(
    r'(?:\n(?:'
    r'Security\s*Risk'
    r'|Credits\s*&\s*Authors'
    r'|Disclaimer\s*&\s*Information'
    r'|Domains'
    r'|References(?:\s*\(Source\))?'   # ← PoC는 References 앞에서 잘라냄
    r'|Copyright'
    r'))\s*:?'
    , flags=re.IGNORECASE
)

def trim_after_poc(content: str) -> str:
    if not content:
        return "None"
    parts = STOP_PATTERN.split(content, maxsplit=1)
    return parts[0].rstrip() if parts else "None"

# ===== Selenium =====
options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("user-agent=Mozilla/5.0")

driver = webdriver.Chrome(options=options)
client_id = str(uuid.uuid4())

try:
    for vuln_id in range(START_ID, END_ID + 1):
        url = f"https://www.vulnerability-lab.com/get_content.php?id={vuln_id}"
        print(f"[+] {url} 접속 중...")

        try:
            driver.get(url)
            time.sleep(2.5)
            body_el = driver.find_element(By.TAG_NAME, "body")
            text = (body_el.text or "")
            if not text or "not found" in text.lower():
                print(f"[!] ID {vuln_id} - 본문 없음/404 가능")
                continue

            text_norm = text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", "    ")
            sections = parse_sections_with_headings(text_norm)

            title_raw = sections.get("Document Title")
            date_raw = sections.get("Release Date")
            cvss_raw = sections.get("Common Vulnerability Scoring System")
            class_raw = sections.get("Vulnerability Class")
            prod_raw = sections.get("Affected Product(s)")
            exploit_raw = sections.get("Exploitation Technique")
            poc_raw = sections.get("Proof of Concept (PoC)")
            cve_raw = sections.get("CVE")
            ref_raw = sections.get("References")  # ✅ References 섹션 원문

            poc_string = trim_after_poc(poc_raw)

            item = {
                "clientId": client_id,
                "host": "www.vulnerability-lab.com",
                "path": f"/get_content.php?id={vuln_id}",
                "title": safe_strip(title_raw) or "None",
                "author": "None",
                "uploadDate": try_parse_date(date_raw) or "None",
                "ref": parse_urls(ref_raw),                 # ✅ URL만 추출하여 배열 저장
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
                ",".join(item.get("ref", ["None"])),        # ✅ dedup_hash에 ref도 반영(선택)
            ])
            item["dedup_hash"] = hashlib.sha256(key_material.encode("utf-8")).hexdigest()

            out_path = os.path.join(SAVE_DIR, f"{vuln_id}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(item, f, ensure_ascii=False, indent=2)

            print(f"[✓] ID {vuln_id} → {out_path}")

        except Exception as e:
            print(f"[!] ID {vuln_id} 에러: {e}")

finally:
    driver.quit()
