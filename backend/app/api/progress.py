from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.db import get_session
from app.core.models import WatchProgress, Profile, Episode, Season

router = APIRouter(prefix="/api/progress", tags=["progress"])

class ProgressIn(BaseModel):
    profile_id: int
    episode_id: int
    position_sec: float
    duration_sec: float | None = None
    completed: bool | None = None

@router.post("/upsert")
async def upsert_progress(data: ProgressIn, session: AsyncSession = Depends(get_session)):
    # validaciones mínimas
    if not (await session.get(Profile, data.profile_id)):
        raise HTTPException(404, "Perfil no existe")
    if not (await session.get(Episode, data.episode_id)):
        raise HTTPException(404, "Episodio no existe")

    row = (await session.execute(
        select(WatchProgress).where(
            WatchProgress.profile_id == data.profile_id,
            WatchProgress.episode_id == data.episode_id
        )
    )).scalar_one_or_none()

    if row:
        row.position_sec = data.position_sec
        if data.duration_sec is not None:
            row.duration_sec = data.duration_sec
        if data.completed is not None:
            row.completed = bool(data.completed)
    else:
        row = WatchProgress(
            profile_id=data.profile_id,
            episode_id=data.episode_id,
            position_sec=data.position_sec,
            duration_sec=data.duration_sec,
            completed=bool(data.completed) if data.completed is not None else False,
            updated_at=datetime.utcnow(),
        )
        session.add(row)

    await session.commit()
    return {"ok": True}

@router.get("/episode")
async def get_episode_progress(profile_id: int = Query(...), episode_id: int = Query(...), session: AsyncSession = Depends(get_session)):
    row = (await session.execute(
        select(WatchProgress).where(
            WatchProgress.profile_id == profile_id,
            WatchProgress.episode_id == episode_id
        )
    )).scalar_one_or_none()
    if not row:
        return {"position_sec": 0, "completed": False}
    return {
        "position_sec": row.position_sec,
        "duration_sec": row.duration_sec,
        "completed": row.completed
    }

@router.get("/series/{series_id}")
async def get_series_progress(series_id: int, profile_id: int = Query(...), session: AsyncSession = Depends(get_session)):
    # devuelve resumen por episodio de esa serie
    from app.core.models import Season, Episode, WatchProgress
    q = (
        select(Episode.id, WatchProgress.position_sec, WatchProgress.completed)
        .join(Season, Episode.season_id == Season.id)
        .join(WatchProgress, (WatchProgress.episode_id == Episode.id) & (WatchProgress.profile_id == profile_id), isouter=True)
        .where(Season.series_id == series_id)
    )
    rows = (await session.execute(q)).all()
    return [
        {
            "episode_id": eid,
            "position_sec": pos if pos is not None else 0,
            "completed": bool(comp) if comp is not None else False
        }
        for (eid, pos, comp) in rows
    ]
