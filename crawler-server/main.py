from logging.handlers import RotatingFileHandler
from contextlib import asynccontextmanager
import logging
import contextvars
from models import mongodb
import beanie
from models.mongo_model import (
    db_Challenge,
    db_Sessions,
    db_Credentials,
    db_Leaked,
    db_Vulnerability,
    db_Requests,
)
from models.request_model import *
from fastapi.middleware.cors import CORSMiddleware
import uuid
from fastapi.responses import JSONResponse
import os
from router import crawlered, challenge
from fastapi import FastAPI, Request


class RequestIdFilter(logging.Filter):
    def filter(self, req):
        req.request_id = request_id_contextvar.get()
        return True


# ContextVar 정의
request_id_contextvar = contextvars.ContextVar("request_id", default=None)

# 로거 설정
logger = logging.getLogger(__name__)
logger.addFilter(RequestIdFilter())
logger.setLevel(logging.INFO)
# 포매터 생성
formatter = logging.Formatter(
    "%(asctime)s - [%(request_id)s] - %(levelname)s - %(message)s"
)
# 콘솔 핸들러 설정
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
# 파일 핸들러 설정
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
file_handler = RotatingFileHandler(
    os.path.join(log_dir, "app.log"), maxBytes=1000000, backupCount=1
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FastAPI lifespan...")
    await mongodb.connect()
    await beanie.init_beanie(
        database=mongodb.db,
        document_models=[
            db_Challenge,
            db_Sessions,
            db_Credentials,
            db_Leaked,
            db_Vulnerability,
            db_Requests,
        ],
    )
    logger.info("DB engine initialized")
    yield
    await mongodb.close()
    logger.info("Stopping FastAPI lifespan...")


app = FastAPI(lifespan=lifespan)
app.include_router(challenge.router)
app.include_router(crawlered.router)

origins = ["*"]
# origins = [""https://crawler.blackwatch.xyzo.me""]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    token = request_id_contextvar.set(request_id)
    try:
        open_paths = [
            "/auth/challenge/init",
            "/auth/challenge/verify",
            "/docs",
            "/redoc",
            "/openapi.json",
        ]
        if request.url.path not in open_paths:
            session_id = request.headers.get("x-session-id")
            if not session_id:
                logger.warning(
                    f"Access denied for {request.url.path}: Missing session id header"
                )
                return JSONResponse(
                    status_code=401, content={"message": "Missing session id"}
                )
            session = await db_Sessions.get(session_id)
            if not session:
                logger.warning(
                    f"Access denied for {request.url.path}: Invalid or expired session ID"
                )
                return JSONResponse(
                    status_code=401, content={"message": "Invalid or expired session"}
                )
            request.state.session = session
        return await call_next(request)
    except Exception as e:
        logger.error(f"Request failed: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        request_id_contextvar.reset(token)
        logger.debug("Request ended")


@app.post("/test")
async def test(req: Vulnerability):
    print(req)
    return "OK"


# class ChallengeVerify(BaseModel):
#     clientId: str
#     challengeId: str
#     signature: str

# class Credentials(Document):
#     id: str = Field(alias="_id")
#     clientId: str
#     clientSecret: str
#     createdAt: datetime
#     class Settings:
#         name = "col_credentials"
