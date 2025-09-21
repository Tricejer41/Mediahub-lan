from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import os
import mimetypes

from app.core.db import get_session
from app.core.models import Episode

router = APIRouter(prefix="/api/stream", tags=["stream"])

CHUNK_SIZE = 1024 * 1024  # 1 MiB


def open_file_range(path: str, start: int, end: int):
    with open(path, "rb") as f:
        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = f.read(min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


@router.get("/{episode_id}")
async def stream_episode(
    episode_id: int,
    range_header: Optional[str] = Header(None, alias="Range"),
    session: AsyncSession = Depends(get_session),
):
    # Buscar episodio
    res = await session.execute(select(Episode).where(Episode.id == episode_id))
    ep = res.scalar_one_or_none()
    if not ep:
        raise HTTPException(404, "Episodio no encontrado")

    path = ep.path
    if not os.path.exists(path):
        raise HTTPException(404, "Archivo no existe en disco")

    file_size = os.path.getsize(path)
    content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"

    # Sin Range -> archivo completo
    if not range_header:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
        }
        return StreamingResponse(
            open_file_range(path, 0, file_size - 1),
            media_type=content_type,
            headers=headers,
        )

    # Con Range -> 206 Partial Content
    try:
        units, rng = range_header.split("=")
        if units != "bytes":
            raise ValueError
        start_s, end_s = (rng.split("-") + [None])[:2]

        if start_s == "":
            # bytes=-N (sufijo)
            length = int(end_s)
            start = max(0, file_size - length)
            end = file_size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s not in (None, "") else file_size - 1

        if start > end or start < 0 or end >= file_size:
            raise ValueError
    except Exception:
        raise HTTPException(416, "Rango inválido")

    resp = StreamingResponse(
        open_file_range(path, start, end),
        media_type=content_type,
        status_code=206,
    )
    resp.headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
    resp.headers["Accept-Ranges"] = "bytes"
    resp.headers["Content-Length"] = str(end - start + 1)
    return resp
