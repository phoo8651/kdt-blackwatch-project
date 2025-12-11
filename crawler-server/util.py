from fastapi import Header, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from models.mongo_model import db_Sessions, db_Requests
from config.config import REQUEST_PER_MINUTE
from datetime import datetime, timezone, timedelta
from beanie import Document
from pydantic import BaseModel
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger('main')

async def get_current_session(request: Request) -> db_Sessions:
    if not hasattr(request.state, "session"):
        raise HTTPException(
            status_code=500,
            detail="Session not found in request.state. Ensure middleware is correctly configured."
        )
    return request.state.session

async def rate_limit(session: db_Sessions = Depends(get_current_session)):
    t = datetime.now(timezone.utc) - timedelta(minutes=1)
    c = await db_Requests.find(
        db_Requests.sessionId == session.id,
        db_Requests.timestamp >= t
    ).count()
    if c >= REQUEST_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Too Many Request. Please try again in a minute.")
    await db_Requests(sessionId=session.id).insert()

async def insert_document(
        model_class: type[Document],
        request_data: BaseModel,
        log_prefix: str
    ) -> JSONResponse:
    try:
        doc = await model_class(**request_data.model_dump()).insert()
        logger.info(f"{log_prefix} data insert success: id={doc.id}")
        return JSONResponse({"message":"success"})
    except PyMongoError as e:
        logger.error(f"{log_prefix} data insert failed due to DB error: {e}")
        return JSONResponse({"message": "database operating failed"}, status_code=500)
    except Exception as e:
        logger.error(f"{log_prefix} data insert failed: {e}")
        return JSONResponse({"message": "an unexpected error occurred"}, status_code=500)