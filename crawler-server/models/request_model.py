from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Any

class ChallengeVerify(BaseModel):
    clientId: str
    challengeId: str
    signature: str

class ChallengeInitRequest(BaseModel):
    clientId: str

class CrawlerData(BaseModel):
    sourceUrl: str
    title: str
    author: str
    publishedAt: datetime
    content: str

class SessionDetail(BaseModel):
    valid: bool = True
    clientId: str
    userId: str
    userIp: str
    createdAt: datetime
    expiresAt: datetime

class Vulnerability(BaseModel):
    clientId: str
    host: str
    path: str
    title: str
    author: str
    uploadDate: str
    cveIds: str
    cvss: str
    vulnerabilityClass: List
    products: List
    exploitationTechnique: List
    article: str
    ref: List

class Leaked(BaseModel):
    leaked: List[dict] = Field(..., min_length=1, title="유출 데이터 목록", description="데이터는 반드시 1개 이상 포함되어야 합니다")
    # clientId: str
    # host: str
    # path: str
    # title: str
    # author: str
    # uploadDate: str
    # leakType: str
    # recordsCount: str
    # iocs: str
    # price: str
    # article: str
    # ref: List
    # leakedEmail: List
    # leakedName: List