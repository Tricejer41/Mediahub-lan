import os
import re
import requests
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.config import settings
from app.core.models import Series

POSTERS_DIR = Path("media/posters")
POSTERS_DIR.mkdir(parents=True, exist_ok=True)


def _slugify(name: str) -> str:
    s = re.sub(r"[^\w\s-]", "", name, flags=re.U)
    s = re.sub(r"\s+", "-", s.strip(), flags=re.U)
    return s.lower()


def _save_image(url: str, basename: str) -> Optional[str]:
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        ext = ".jpg"
        out_rel = f"posters/{basename}{ext}"
        out_abs = POSTERS_DIR / f"{basename}{ext}"
        with open(out_abs, "wb") as f:
            f.write(r.content)
        return out_rel
    except Exception:
        return None


def _tmdb_search_and_download(title: str) -> Optional[str]:
    api_key = os.getenv("TMDB_API_KEY") or getattr(settings, "TMDB_API_KEY", None)
    if not api_key:
        return None
    try:
        # 1) Buscar por TV (mucho anime es "TV" en TMDb)
        url = "https://api.themoviedb.org/3/search/tv"
        r = requests.get(url, params={"api_key": api_key, "query": title}, timeout=15)
        r.raise_for_status()
        data = r.json()
        results = data.get("results") or []
        if not results:
            # 2) Probar como película
            url = "https://api.themoviedb.org/3/search/movie"
            r = requests.get(
                url, params={"api_key": api_key, "query": title}, timeout=15
            )
            r.raise_for_status()
            data = r.json()
            results = data.get("results") or []
            if not results:
                return None
        # Elegir el más popular con poster_path
        results = [x for x in results if x.get("poster_path")]
        if not results:
            return None
        results.sort(key=lambda x: x.get("popularity", 0), reverse=True)
        poster_path = results[0]["poster_path"]
        # TMDb images: base fijo
        img_url = f"https://image.tmdb.org/t/p/w780{poster_path}"
        return img_url
    except Exception:
        return None


def _anilist_search_and_download(title: str) -> Optional[str]:
    # GraphQL público, no requiere clave
    query = """
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        coverImage { extraLarge large }
      }
    }"""
    try:
        r = requests.post(
            "https://graphql.anilist.co",
            json={"query": query, "variables": {"search": title}},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        media = data.get("data", {}).get("Media")
        if not media:
            return None
        img = media.get("coverImage", {}).get("extraLarge") or media.get(
            "coverImage", {}
        ).get("large")
        return img
    except Exception:
        return None


async def fetch_poster_for_series(session: AsyncSession, series_id: int) -> dict:
    s = (
        await session.execute(select(Series).where(Series.id == series_id))
    ).scalar_one_or_none()
    if not s:
        return {"ok": False, "error": "Serie no existe"}

    # si ya existe, devolver
    if s.poster_rel:
        return {"ok": True, "poster": s.poster_rel, "cached": True}

    # buscar url (TMDb -> AniList)
    url = _tmdb_search_and_download(s.name) or _anilist_search_and_download(s.name)
    if not url:
        return {"ok": False, "error": "No se encontró póster en TMDb/AniList"}

    # guardar imagen
    basename = f"{s.id}-{_slugify(s.name)}"
    rel = _save_image(url, basename)
    if not rel:
        return {"ok": False, "error": "No se pudo descargar/guardar la imagen"}

    s.poster_rel = rel
    await session.commit()
    return {"ok": True, "poster": rel, "cached": False}


async def fetch_all_missing_posters(session: AsyncSession) -> dict:
    rows = (
        (await session.execute(select(Series).where(Series.poster_rel.is_(None))))
        .scalars()
        .all()
    )
    total = len(rows)
    created = 0
    for s in rows:
        # Reutilizamos la función individual
        r = await fetch_poster_for_series(session, s.id)
        if r.get("ok") and not r.get("cached"):
            created += 1
    return {"ok": True, "processed": total, "created": created}
