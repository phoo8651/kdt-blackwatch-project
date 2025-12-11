import re, hashlib
from urllib.parse import urlparse

_CVE_RX = re.compile(r'\bCVE-\d{4}-\d{4,7}\b', re.I)

def _canonical_url_from_host_path(host: str, path: str) -> str:
    host = (host or "").strip().lower()
    path = (path or "").strip()
    path = re.sub(r'/+', '/', ('/' + path).replace('//', '/'))
    return f"https://{host}{path}"

def _norm_title(t: str) -> str:
    t = (t or '').strip().lower()
    t = re.sub(r'[\[\(].*?[\]\)]', '', t)
    t = re.sub(r'\s+', ' ', t)
    return t

def _cluster_key_by_schema(item: dict) -> tuple:
    title = item.get("title", "")
    host  = item.get("host", "")
    path  = item.get("path", "")
    url   = _canonical_url_from_host_path(host, path)
    cves  = _CVE_RX.findall(f"{title} {url}")
    if cves:
        return ("cve", tuple(sorted(set(cves))))
    nt = _norm_title(title)
    if nt:
        return ("title", nt)
    return ("url", url)

def _dedupe_lines(text: str) -> str:
    seen, out = set(), []
    for line in (text or "").splitlines():
        key = hashlib.sha1(line.strip().encode()).hexdigest()
        if line.strip() and key not in seen:
            seen.add(key); out.append(line)
    return "\n".join(out)

def _merge_into_article_body(base: dict, extra: dict) -> None:
    # ａｒｔｃｉｌ ＋ｐｏｃ
    base_body  = (base.get("article") or "").strip()
    extra_body = (extra.get("article") or "").strip()
    merged = base_body
    if extra_body:
        merged = (merged + "\n\n---\n\n" if merged else "") + extra_body

    
    links = []
    def add_link(item):
        h, p = item.get("host", ""), item.get("path", "")
        if h:
            links.append(_canonical_url_from_host_path(h, p))
    add_link(base); add_link(extra)
    # 중복 제거 구간
    uniq_links = [u for i, u in enumerate(links) if u and u not in links[:i]]

    merged = _dedupe_lines(merged)
    if uniq_links:
        merged += "\n\n---\nReferences:\n" + "\n".join(f"- {u}" for u in uniq_links)

    base["article"] = merged

   
    if extra.get("types"):
        base["types"] = sorted({*(base.get("types") or []), *extra["types"]})
    sev_rank = {"critical":4,"high":3,"medium":2,"low":1}
    b = sev_rank.get(str(base.get("severity","")).lower(), 0)
    e = sev_rank.get(str(extra.get("severity","")).lower(), 0)
    if e > b:
        base["severity"] = extra.get("severity")
    if not base.get("cve") and extra.get("cve"):
        base["cve"] = extra["cve"]
    if (extra_ts := extra.get("uploadDate")):
        base_ts = base.get("uploadDate")
        if not base_ts or extra_ts > base_ts:
            base["uploadDate"] = extra_ts

def _score_for_rep(x: dict) -> tuple:
    c_len = len((x.get("article") or ""))
    ts    = x.get("uploadDate") or ""
    url   = _canonical_url_from_host_path(x.get("host",""), x.get("path",""))
    return (c_len, ts, -len(url))

def coalesce_unified_by_schema(candidates: list[dict]) -> list[dict]:
    # 클러스터
    clusters = {}
    for it in candidates:
        clusters.setdefault(_cluster_key_by_schema(it), []).append(it)

    #  병합 과정
    out, seen = [], set()
    for _, items in clusters.items():
        rep = sorted(items, key=_score_for_rep, reverse=True)[0]
        for x in items:
            if x is rep: 
                continue
            _merge_into_article_body(rep, x)

        #  중복 방지
        cu = _canonical_url_from_host_path(rep.get("host",""), rep.get("path",""))
        nt = _norm_title(rep.get("title",""))
        key = (cu, nt)
        if key in seen:
            continue
        seen.add(key)
        out.append(rep)
    return out
