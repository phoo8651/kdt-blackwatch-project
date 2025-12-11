import base64, hmac, hashlib
from typing import Any, Dict, Optional
import requests
from requests.adapters import HTTPAdapter
from common.settings import get_settings

try:
    from urllib3.util.retry import Retry
except Exception:
    from urllib3.util import Retry

def _make_retry():
    params = dict(total=3, backoff_factor=1.2,
                  status_forcelist=(429,500,502,503,504), raise_on_status=False)
    try:
        return Retry(allowed_methods=frozenset({"GET","POST","PUT","DELETE","HEAD","OPTIONS"}), **params)
    except TypeError:
        return Retry(method_whitelist=frozenset({"GET","POST","PUT","DELETE","HEAD","OPTIONS"}), **params)

def _rotate_tor_identity():
    try:
        from stem import Signal
        from stem.control import Controller
        s = get_settings()
        with Controller.from_port(address=s.TOR_CONTROL_HOST, port=s.TOR_CONTROL_PORT) as c:
            if s.TOR_CONTROL_PASSWORD:
                c.authenticate(password=s.TOR_CONTROL_PASSWORD)
            else:
                c.authenticate()
            c.signal(Signal.NEWNYM)
    except Exception:
        pass

def _make_session() -> requests.Session:
    s = get_settings()
    sess = requests.Session()
    retries = _make_retry()
    sess.mount("http://", HTTPAdapter(max_retries=retries))
    sess.mount("https://", HTTPAdapter(max_retries=retries))
    if s.USE_TOR:
        # DNS가 살아있을 땐 socks5h 권장. /etc/hosts 강제매핑을 쓰려면 'socks5'로 바꿔 쓰기.
        sess.proxies.update({
            "http":  f"socks5h://{s.TOR_SOCKS}",
            "https": f"socks5h://{s.TOR_SOCKS}",
        })
    sess.headers.update({"User-Agent": s.USER_AGENT, "Content-Type": "application/json"})
    return sess

class CrawlerSession:
    def __init__(self):
        self.session = _make_session()
        self.authenticated = False

    def login(self):
        s = get_settings()
        r1 = self.session.post(f"{s.ENDPOINT}/auth/challenge/init",
                               json={"clientId": s.CLIENT_ID}, timeout=s.HTTP_TIMEOUT)
        if r1.status_code == 409:
            self.authenticated = True
            return
        if r1.status_code != 200:
            raise RuntimeError(f"❌ Challenge 요청 실패: {r1.status_code} {r1.text}")

        res1 = r1.json()
        challenge_id = res1["challengeId"]
        nonce = base64.b64decode(res1["nonce"])
        signature = hmac.new(s.CLIENT_SECRET.encode(), nonce, hashlib.sha256).hexdigest()

        r2 = self.session.post(f"{s.ENDPOINT}/auth/challenge/verify",
                               json={"clientId": s.CLIENT_ID,
                                     "challengeId": challenge_id,
                                     "signature": signature},
                               timeout=s.HTTP_TIMEOUT)
        if r2.status_code == 200:
            self.authenticated = True
            print("✅ 세션 로그인 성공")
        else:
            self.authenticated = False
            raise RuntimeError(f"❌ 로그인 실패: {r2.status_code} {r2.text}")

    def post_with_retry(self, path: str, data: Dict[str, Any],
                        rotate_identity: bool=False, timeout: Optional[int]=None) -> requests.Response:
        s = get_settings()
        if rotate_identity and s.USE_TOR:
            _rotate_tor_identity()
        if not self.authenticated:
            self.login()
        url = f"{s.ENDPOINT}{path}"
        to = timeout or s.HTTP_TIMEOUT
        res = self.session.post(url, json=data, timeout=to)
        if res.status_code == 401:
            print("⚠️ 세션 만료됨. 재로그인 시도…")
            self.authenticated = False
            self.login()
            res = self.session.post(url, json=data, timeout=to)
        return res

    def logout(self):
        s = get_settings()
        try:
            self.session.post(f"{s.ENDPOINT}/auth/logout", timeout=s.HTTP_TIMEOUT)
            print("🚪 로그아웃 완료")
        except Exception:
            print("⚠️ 로그아웃 실패")
        finally:
            self.authenticated = False

_client = CrawlerSession()

def post_with_retry(path: str, json: Dict[str, Any],
                    rotate_identity: bool=False, timeout: Optional[int]=None) -> requests.Response:
    return _client.post_with_retry(path, json, rotate_identity, timeout)

def logout():
    _client.logout()
