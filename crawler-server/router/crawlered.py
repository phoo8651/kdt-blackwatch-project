from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from models.request_model import Leaked, Vulnerability
from models.mongo_model import db_Leaked, db_Vulnerability
from util import insert_document, rate_limit
import logging


logger = logging.getLogger('main')

router = APIRouter(
    prefix="/data",
    tags=["crawlered"],
    dependencies=[Depends(rate_limit)]
)

@router.post("/vulnerability")
async def crawler_vulnerability(req: Vulnerability):
    return await insert_document(
        model_class=db_Vulnerability,
        request_data=req,
        log_prefix="vuln"
    )

@router.post("/leaked")
async def crawler_leaked(req: Leaked):
    return await insert_document(
        model_class=db_Leaked,
        request_data=req,
        log_prefix="leak"
    )