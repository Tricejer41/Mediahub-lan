from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.services.posters import fetch_poster_for_series, fetch_all_missing_posters

router = APIRouter(prefix="/api/posters", tags=["posters"])

@router.post("/fetch")
async def fetch_poster(series_id: int = Query(...), session: AsyncSession = Depends(get_session)):
    return await fetch_poster_for_series(session, series_id)

@router.post("/fetch_all_missing")
async def fetch_all(session: AsyncSession = Depends(get_session)):
    return await fetch_all_missing_posters(session)
