from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.services.thumbs import build_missing_thumbs

router = APIRouter(prefix="/api/thumbs", tags=["thumbs"])

@router.post("/build")
async def build_thumbs(session: AsyncSession = Depends(get_session)):
    return await build_missing_thumbs(session)
