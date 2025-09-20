from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_session
from app.core.models import Series, Season, Episode

router = APIRouter(prefix="/api/catalog", tags=["catalog"])

@router.get("/series")
async def list_series(session: AsyncSession = Depends(get_session)):
    rows = (await session.execute(select(Series).order_by(Series.name))).scalars().all()
    return [{"id": s.id, "name": s.name} for s in rows]

@router.get("/series/{series_id}")
async def series_detail(series_id: int, session: AsyncSession = Depends(get_session)):
    s = (await session.execute(select(Series).where(Series.id == series_id))).scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Serie no encontrada")
    seas = (await session.execute(select(Season).where(Season.series_id == s.id).order_by(Season.number))).scalars().all()
    out = {"id": s.id, "name": s.name, "seasons": []}
    for sea in seas:
        eps = (await session.execute(
            select(Episode).where(Episode.season_id == sea.id).order_by(Episode.number.is_(None), Episode.number, Episode.title)
        )).scalars().all()
        out["seasons"].append({
            "number": sea.number,
            "episodes": [{
                "id": e.id, "number": e.number, "title": e.title,
                "path": e.path, "duration": e.duration_sec, "w": e.width, "h": e.height,
            } for e in eps]
        })
    return out
