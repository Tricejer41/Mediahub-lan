import os, shlex, subprocess, hashlib
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Episode

THUMBS_DIR = Path("media/thumbs")
THUMBS_DIR.mkdir(parents=True, exist_ok=True)

def thumb_name_for(path: str) -> str:
    # Nombre determinista según ruta del fichero origen
    h = hashlib.sha1(path.encode("utf-8")).hexdigest()[:16]
    return f"{h}.jpg"

def ensure_thumbnail(src_path: str) -> str | None:
    """
    Genera y devuelve la ruta relativa 'thumbs/xxx.jpg' si se puede crear,
    o None si falla. Usa un frame a 10s, escalado a 480px de ancho máx.
    """
    if not os.path.exists(src_path):
        return None

    name = thumb_name_for(src_path)
    out_rel = f"thumbs/{name}"
    out_abs = THUMBS_DIR / name
    if out_abs.exists():
        return out_rel

    # ffmpeg: coger frame en 10s, escalar manteniendo aspecto, calidad buena
    cmd = (
        f'ffmpeg -v error -ss 00:00:10 -i {shlex.quote(src_path)} -frames:v 1 '
        f'-vf "scale=\'min(480,iw)\':-2" -q:v 3 {shlex.quote(str(out_abs))} -y'
    )
    proc = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode == 0 and out_abs.exists():
        return out_rel
    return None

async def build_missing_thumbs(session: AsyncSession) -> dict:
    """
    Recorre episodios sin thumb_rel y trata de generarla.
    """
    total = 0
    created = 0

    rows = (await session.execute(select(Episode).where(Episode.thumb_rel.is_(None)))).scalars().all()
    for ep in rows:
        total += 1
        rel = ensure_thumbnail(ep.path)
        if rel:
            ep.thumb_rel = rel
            created += 1

    await session.commit()
    return {"ok": True, "processed": total, "created": created}
