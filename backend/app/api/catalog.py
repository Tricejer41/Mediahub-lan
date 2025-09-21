from fastapi import APIRouter, Depends, HTTPException, Query
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

    seas = (
        await session.execute(
            select(Season).where(Season.series_id == s.id).order_by(Season.number)
        )
    ).scalars().all()

    out = {"id": s.id, "name": s.name, "seasons": []}

    for sea in seas:
        eps = (
            await session.execute(
                select(Episode)
                .where(Episode.season_id == sea.id)
                .order_by(Episode.number.is_(None), Episode.number, Episode.title)
            )
        ).scalars().all()

        out["seasons"].append(
            {
                "number": sea.number,
                "episodes": [
                    {
                        "id": e.id,
                        "number": e.number,
                        "title": e.title,
                        "path": e.path,
                        "duration": e.duration_sec,
                        "w": e.width,
                        "h": e.height,
                        "thumb_rel": e.thumb_rel,  # <-- miniatura del episodio
                    }
                    for e in eps
                ],
            }
        )

    return out


@router.get("/search")
async def search_series(
    q: str = Query(..., min_length=1),
    session: AsyncSession = Depends(get_session),
):
    rows = (
        await session.execute(
            select(Series).where(Series.name.ilike(f"%{q}%")).order_by(Series.name)
        )
    ).scalars().all()
    return [{"id": s.id, "name": s.name} for s in rows]

@router.get("/series/{series_id}/cover")
async def series_cover(series_id: int, session: AsyncSession = Depends(get_session)):
    s = (await session.execute(select(Series).where(Series.id == series_id))).scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Serie no encontrada")
    if s.poster_rel:
        return {"cover": s.poster_rel, "source": "poster"}
    # fallback: usar la miniatura representativa existente
    row = (
        await session.execute(
            select(Episode.thumb_rel)
            .join(Season, Episode.season_id == Season.id)
            .where(Season.series_id == series_id, Episode.thumb_rel.is_not(None))
            .order_by(Season.number, Episode.number.is_(None), Episode.number, Episode.title)
            .limit(1)
        )
    ).first()
    if row:
        return {"cover": row[0], "source": "thumb"}
    return {"cover": None, "source": None}

@router.get("/series/{series_id}/thumb")
async def series_thumb(series_id: int, session: AsyncSession = Depends(get_session)):
    # Miniatura "representativa" de la serie: el primer episodio con thumb
    row = (
        await session.execute(
            select(Episode.thumb_rel)
            .join(Season, Episode.season_id == Season.id)
            .where(Season.series_id == series_id, Episode.thumb_rel.is_not(None))
            .order_by(Season.number, Episode.number.is_(None), Episode.number, Episode.title)
            .limit(1)
        )
    ).first()

    return {"thumb": row[0] if row else None}
