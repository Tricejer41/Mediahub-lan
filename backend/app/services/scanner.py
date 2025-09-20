import json, re, subprocess, shlex, os
from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.models import Series, Season, Episode

VIDEO_EXT = {".mp4", ".mkv", ".m4v"}

RX_SXXEYY = re.compile(r"[Ss](\d{1,2})[ ._-]*[Ee](\d{1,2})")
RX_XxYY   = re.compile(r"(\d{1,2})x(\d{1,2})")
RX_TEMP   = re.compile(r"(?:Temporada|Season)[ _-]*(\d{1,2})", re.I)

def guess_season(parts: list[str]) -> int:
    # busca "Temporada N" o "Season N" en la ruta; si no, 1
    for p in reversed(parts):
        m = RX_TEMP.search(p)
        if m: return int(m.group(1))
    return 1

def guess_episode_number(name: str) -> Optional[int]:
    for rx in (RX_SXXEYY, RX_XxYY):
        m = rx.search(name)
        if m: return int(m.group(2))
    m = re.search(r"(?:^|[^0-9])(ep|e|cap)[ ._-]?(\d{1,3})(?:[^0-9]|$)", name, re.I)
    if m: return int(m.group(2))
    nums = re.findall(r"(\d{1,3})", name)
    return int(nums[-1]) if nums else None

def ffprobe_info(path: str) -> dict:
    # Extrae duración, tamaño, vcodec, acodec, resolución
    cmd = (
        'ffprobe -v error '
        '-select_streams v:0 -show_entries stream=codec_name,width,height '
        '-show_entries format=duration,size '
        '-of json ' + shlex.quote(path)
    )
    out = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if out.returncode != 0:
        return {}
    try:
        data = json.loads(out.stdout)
    except json.JSONDecodeError:
        return {}
    info = {
        "duration": float(data.get("format", {}).get("duration", 0)) if data.get("format") else None,
        "size": int(data.get("format", {}).get("size", 0)) if data.get("format") else None,
        "vcodec": None,
        "acodec": None,
        "width": None,
        "height": None,
    }
    streams = data.get("streams") or []
    if streams:
        s0 = streams[0]
        info["vcodec"] = s0.get("codec_name")
        info["width"]  = s0.get("width")
        info["height"] = s0.get("height")
    # audio codec (mejor intento rápido)
    # una segunda pasada ligera: -select_streams a:0
    cmd2 = 'ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of json ' + shlex.quote(path)
    out2 = subprocess.run(cmd2, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if out2.returncode == 0:
        try:
            data2 = json.loads(out2.stdout)
            if data2.get("streams"):
                info["acodec"] = data2["streams"][0].get("codec_name")
        except json.JSONDecodeError:
            pass
    return info

async def get_or_create_series(session: AsyncSession, name: str) -> Series:
    res = await session.execute(select(Series).where(Series.name == name))
    s = res.scalar_one_or_none()
    if s: return s
    s = Series(name=name)
    session.add(s)
    await session.flush()
    return s

async def get_or_create_season(session: AsyncSession, series: Series, number: int) -> Season:
    res = await session.execute(
        select(Season).where(Season.series_id == series.id, Season.number == number)
    )
    sea = res.scalar_one_or_none()
    if sea: return sea
    sea = Season(series_id=series.id, number=number)
    session.add(sea)
    await session.flush()
    return sea

async def upsert_episode(session: AsyncSession, season: Season, path: Path, epnum: Optional[int]):
    # ¿ya existe por path?
    res = await session.execute(select(Episode).where(Episode.path == str(path)))
    ep = res.scalar_one_or_none()
    if ep:
        # actualizar campos básicos si faltan
        if ep.number is None and epnum is not None:
            ep.number = epnum
        return ep

    st = path.stat()
    meta = ffprobe_info(str(path))
    ep = Episode(
        season_id=season.id,
        number=epnum,
        title=path.stem[:255],
        path=str(path),
        size_bytes=meta.get("size") or st.st_size,
        duration_sec=meta.get("duration"),
        vcodec=meta.get("vcodec"),
        acodec=meta.get("acodec"),
        width=meta.get("width"),
        height=meta.get("height"),
    )
    session.add(ep)
    return ep

async def scan_library(session: AsyncSession) -> dict:
    root = Path(settings.MEDIA_SERIES)
    if not root.exists():
        return {"ok": False, "error": f"No existe {root}"}

    created = 0
    updated = 0

    # Estructura esperada: /Anime/<Serie>/[Temporada X]/archivo
    for series_dir in sorted([p for p in root.iterdir() if p.is_dir()]):
        series = await get_or_create_series(session, series_dir.name)

        for file_or_dir in series_dir.iterdir():
            # si hay subcarpetas de temporada
            if file_or_dir.is_dir():
                season_number = guess_season(file_or_dir.parts)
                season = await get_or_create_season(session, series, season_number)
                for video in file_or_dir.rglob("*"):
                    if video.is_file() and video.suffix.lower() in VIDEO_EXT:
                        epnum = guess_episode_number(video.name)
                        before = await session.execute(select(Episode).where(Episode.path == str(video)))
                        exists = before.scalar_one_or_none()
                        await upsert_episode(session, season, video, epnum)
                        created += 0 if exists else 1
                        updated += 1 if exists else 0
            else:
                # archivos directamente bajo la serie => season 1
                if file_or_dir.is_file() and file_or_dir.suffix.lower() in VIDEO_EXT:
                    season = await get_or_create_season(session, series, 1)
                    epnum = guess_episode_number(file_or_dir.name)
                    before = await session.execute(select(Episode).where(Episode.path == str(file_or_dir)))
                    exists = before.scalar_one_or_none()
                    await upsert_episode(session, season, file_or_dir, epnum)
                    created += 0 if exists else 1
                    updated += 1 if exists else 0

    await session.commit()
    return {"ok": True, "created": created, "updated": updated}
