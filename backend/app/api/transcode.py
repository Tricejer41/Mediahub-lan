from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import shlex
import subprocess

from app.core.db import get_session
from app.core.models import Episode
from app.services.compat import is_browser_friendly

router = APIRouter(prefix="/api/transcode", tags=["transcode"])


def iter_ffmpeg_stdout(cmd: str, bufsize: int = 1024 * 64):
    """
    Lanza ffmpeg y stream de stdout en chunks. Sin soporte Range (progresivo).
    """
    proc = subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        bufsize=bufsize,
    )
    try:
        while True:
            chunk = proc.stdout.read(bufsize)
            if not chunk:
                break
            yield chunk
    finally:
        if proc and proc.poll() is None:
            proc.terminate()


@router.get("/mp4/{episode_id}")
async def transcode_mp4(episode_id: int, session: AsyncSession = Depends(get_session)):
    ep = (
        await session.execute(select(Episode).where(Episode.id == episode_id))
    ).scalar_one_or_none()
    if not ep:
        raise HTTPException(404, "Episodio no encontrado")
    if not os.path.exists(ep.path):
        raise HTTPException(404, "Archivo no existe en disco")

    # Si ya es compatible, mejor redirigir al Direct Play
    if is_browser_friendly(ep.vcodec, ep.acodec, ep.path):
        # usa tu endpoint directo actual
        return RedirectResponse(url=f"/api/stream/{episode_id}", status_code=302)

    # Transcode al vuelo a MP4 H.264/AAC progresivo
    # Ajustes: límite 1080p, preset veryfast, CRF 23, AAC 160k, moov fragmentado para progressive download
    # Si la Pi va justa, baja a 720p: "-vf scale='min(1280,iw)':-2"
    vf_scale = "-vf scale='min(1920,iw)':-2"
    cmd = (
        "ffmpeg -v error "
        f"-i {shlex.quote(ep.path)} "
        "-map 0:v:0 -map 0:a:0 "
        "-c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -profile:v high -level 4.1 "
        "-c:a aac -b:a 160k -ac 2 -ar 48000 "
        f"{vf_scale} "
        "-movflags +frag_keyframe+empty_moov "
        "-f mp4 -"
    )

    return StreamingResponse(iter_ffmpeg_stdout(cmd), media_type="video/mp4")
