import pymongo
from beanie import Document, Indexed
from datetime import datetime, timezone
from pydantic import Field
from typing import List, Dict
import ulid, uuid

class db_Challenge(Document):
    id: str = Field(default_factory=lambda: str(ulid.new()), alias="_id")
    clientId: Indexed(str, unique=True)
    nonce: str
    expiresAt: datetime
    verified: bool = False
    class Settings:
        name = "col_challenge"
        indexes = [
            pymongo.IndexModel([("expiresAt", pymongo.ASCENDING)], expireAfterSeconds=0)
        ]

class db_Sessions(Document):
    id: str = Field(default_factory=lambda: str(ulid.new()), alias="_id")
    clientId: Indexed(str, unique=True)
    userId: str
    userIp: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    expiresAt: datetime
    class Settings:
        name = "col_sessions"
        indexes = [
            pymongo.IndexModel([("expiresAt", pymongo.ASCENDING)], expireAfterSeconds=0)
        ]

class db_Credentials(Document):
    id: str = Field(alias="_id")
    clientId: str
    clientSecret: str
    createdAt: datetime
    class Settings:
        name = "col_credentials"

class db_Vulnerability(Document):
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
    class Settings:
        name = 'col_vulnerability'

class db_Leaked(Document):
    clientId: str
    host: str
    path: str
    title: str
    author: str
    uploadDate: str
    leakType: str
    recordsCount: str
    iocs: List
    price: str
    article: str
    ref: List
    # leakedEmail: List
    # leakedName: List
    leaked: List[Dict]
    class Settings:
        name = 'col_leaked'

class db_Requests(Document):
    sessionId: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    class Settings:
        name = "col_requests"
        indexes = [
            [("sessionId", pymongo.ASCENDING)],
            [("timestamp", pymongo.ASCENDING)],
            pymongo.IndexModel([("timestamp", pymongo.ASCENDING)], expireAfterSeconds=3600)
        ]