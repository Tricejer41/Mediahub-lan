from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.services.scanner import scan_library

router = APIRouter(prefix="/api/scan", tags=["scan"])

@router.post("")
async def trigger_scan(session: AsyncSession = Depends(get_session)):
    result = await scan_library(session)
    return result
