from typing import Optional
from fastapi import APIRouter, Request, Depends, Header
import hmac
import hashlib
from models.mongo_model import *
from models.request_model import *
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, timezone
import os
import base64
import logging
import util

logger = logging.getLogger('main')

router = APIRouter(
    prefix="/auth",
    tags=["chellenge"]
)

@router.post("/challenge/init")
async def challenge_init(req: ChallengeInitRequest):
    clientId = req.clientId
    if not clientId:
        return JSONResponse({"message": "clientId is required"}, status_code=400)
    if not await db_Credentials.find_one(db_Credentials.clientId == clientId):
        return JSONResponse({"message": "Unknown clientId"}, status_code=400)
    if await db_Sessions.find_one(db_Sessions.clientId == clientId):
        return JSONResponse({"message": "Client already initialized"}, status_code=409)

    nonce = os.urandom(32)
    nonce_b64 = base64.b64encode(nonce).decode()

    challenge = db_Challenge(
        clientId=clientId,
        nonce=nonce_b64,
        expiresAt=datetime.now(timezone.utc) + timedelta(seconds=60)
    )
    await challenge.insert()
    insert_result = await db_Challenge.find_one(db_Challenge.clientId == clientId)
    if insert_result:
        logger.info(f"Challenge successfully inserted: {insert_result.clientId}")
    else:
        logger.error(f"Challenge failed to insert")

    return JSONResponse({"challengeId": insert_result.id, "nonce": insert_result.nonce, "ttl": 60}, status_code=200)

@router.post("/challenge/verify")
async def challenge_verify(req: ChallengeVerify, request: Request):
    clientId = req.clientId
    challengeId = req.challengeId
    signature = req.signature
    ip = request.client.host

    if not all([clientId, challengeId, signature]):
        return JSONResponse({"message": "Missing fields"}, status_code=400)

    challenge = await db_Challenge.find_one(db_Challenge.id == challengeId, db_Challenge.clientId == clientId)
    if not challenge:
        return JSONResponse({"message": "Challenge not found"}, status_code=404)
    if challenge.verified:
        return JSONResponse({"message": "Challenge already used"}, status_code=403)

    credential = await db_Credentials.find_one(db_Credentials.clientId==clientId)
    if not credential:
        return JSONResponse({"message": "Credential not found"}, status_code=400)

    secret = credential.clientSecret
    user_id = credential.id

    nonce = base64.b64decode(challenge.nonce)
    expected = hmac.new(secret.encode(), nonce, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return JSONResponse({"message": "Invalid signature"}, status_code=401)

    await challenge.set({db_Challenge.verified:True})

    session_doc = db_Sessions(
        clientId=clientId,
        userId=user_id,
        userIp=ip,
        expiresAt=datetime.now(timezone.utc) + timedelta(days=1)
    )

    await session_doc.insert()
    insert_result = await db_Sessions.find_one(db_Sessions.clientId == clientId)
    if insert_result:
        logger.info(f"session create for client {insert_result.clientId}")
    else:
        logger.error(f"session create failed")
        return JSONResponse({"message": "failed"}, status_code=500)

    return JSONResponse({"message": "Session granted", "sessionId": insert_result.id}, status_code=200)

@router.post("/logout")
async def logout(session: db_Sessions = Depends(util.get_current_session)):
    await session.delete()
    logger.info(f'session deleted: {session.id}')
    return JSONResponse({"message": "Logged out"}, status_code=200)


@router.get("/session/check", response_model=SessionDetail)
async def session_check(session: db_Sessions = Depends(util.get_current_session)):
    return session