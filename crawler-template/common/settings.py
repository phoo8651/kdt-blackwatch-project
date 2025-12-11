from functools import lru_cache
from typing import Optional
from pydantic import BaseSettings, AnyUrl, validator

class Settings(BaseSettings):
    # ===== Server =====
    ENDPOINT: AnyUrl
    CLIENT_ID: str
    CLIENT_SECRET: str

    # ===== Network =====
    USE_TOR: bool = True
    HTTP_TIMEOUT: int = 60

    # ===== Tor =====
    TOR_SOCKS: str = "127.0.0.1:9050"
    TOR_CONTROL_HOST: str = "127.0.0.1"
    TOR_CONTROL_PORT: int = 9051
    TOR_CONTROL_PASSWORD: str = ""
    TOR_IDENTITY_INTERVAL_SEC: int = 180

    USER_AGENT: str = "BlackWatch/1.0"

    #  Telegram (있으면 사용) =
    API_ID: Optional[str] = None
    API_HASH: Optional[str] = None
    BOT_TOKEN: Optional[str] = None

    #  API 전송 
    USE_API: bool = False
    API_BASE: Optional[AnyUrl] = None          # 없으면 ENDPOINT 사용
    API_VULN: str = "/v1/vuln"
    API_LEAK: str = "/v1/leak"

    #  API-Key 또는 OAuth2(Client Credentials)
    API_KEY_HEADER: str = "X-API-Key"
    API_KEY_TEST: Optional[str] = None
    AUTH_TOKEN_PATH: str = "/auth/token"

    # Mongo  
    USE_MONGO: bool = False
    MONGO_URI: Optional[str] = None
    MONGO_DB: str = "blackwatch"
    MONGO_COLLECTION: str = "articles"

    @validator("HTTP_TIMEOUT")
    def _timeout_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("HTTP_TIMEOUT must be > 0")
        return v

    @property
    def API_BASE_EFFECTIVE(self) -> str:
        return (str(self.API_BASE) if self.API_BASE else str(self.ENDPOINT)).rstrip("/")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
