from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.models import Profile

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

# Config
MAX_PROFILES = 4
AVATARS_DIR = Path("media/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)


# ---- Schemas ----
class ProfileIn(BaseModel):
    name: str
    avatar: str | None = None
    is_kid: bool = False


class ProfileOut(BaseModel):
    id: int
    name: str
    avatar: str | None
    is_kid: bool


class AvatarIn(BaseModel):
    avatar: str | None = None


# ---- Avatares predefinidos ----
@router.get("/avatars")
async def list_avatars():
    """Lista de avatares disponibles en media/avatars (png/jpg/webp/svg)."""
    exts = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
    files = [f.name for f in AVATARS_DIR.glob("*") if f.is_file() and f.suffix.lower() in exts]
    files.sort()
    return [{"id": name, "url": f"/static/avatars/{name}"} for name in files]


# ---- CRUD perfiles ----
@router.get("", response_model=list[ProfileOut])
async def list_profiles(session: AsyncSession = Depends(get_session)):
    rows = (await session.execute(select(Profile).order_by(Profile.id))).scalars().all()
    return [{"id": p.id, "name": p.name, "avatar": p.avatar, "is_kid": p.is_kid} for p in rows]


@router.post("", response_model=ProfileOut, status_code=201)
async def create_profile(data: ProfileIn, session: AsyncSession = Depends(get_session)):
    count = (await session.execute(select(func.count()).select_from(Profile))).scalar_one()
    if count >= MAX_PROFILES:
        raise HTTPException(400, f"Se alcanzó el máximo de perfiles ({MAX_PROFILES}).")

    exists = (await session.execute(select(Profile).where(Profile.name == data.name))).scalar_one_or_none()
    if exists:
        raise HTTPException(400, "Ya existe un perfil con ese nombre.")

    p = Profile(name=data.name.strip(), avatar=data.avatar, is_kid=data.is_kid)
    session.add(p)
    await session.commit()
    return {"id": p.id, "name": p.name, "avatar": p.avatar, "is_kid": p.is_kid}


@router.get("/{profile_id}")
async def get_profile(profile_id: int, session: AsyncSession = Depends(get_session)):
    p = (await session.execute(select(Profile).where(Profile.id == profile_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Perfil no encontrado.")
    return {"id": p.id, "name": p.name, "avatar": p.avatar, "is_kid": p.is_kid}


@router.patch("/{profile_id}/avatar")
async def set_avatar(profile_id: int, data: AvatarIn, session: AsyncSession = Depends(get_session)):
    p = (await session.execute(select(Profile).where(Profile.id == profile_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Perfil no encontrado.")

    if not data.avatar:
        p.avatar = None
    else:
        if not (AVATARS_DIR / data.avatar).exists():
            raise HTTPException(400, "Avatar no existe.")
        p.avatar = data.avatar

    await session.commit()
    return {"ok": True, "avatar": p.avatar}


@router.delete("/{profile_id}", status_code=200)
async def delete_profile(profile_id: int, session: AsyncSession = Depends(get_session)):
    p = (await session.execute(select(Profile).where(Profile.id == profile_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Perfil no encontrado.")
    await session.delete(p)
    await session.commit()
    return {"ok": True}
