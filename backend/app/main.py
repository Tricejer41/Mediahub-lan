from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from fastapi.staticfiles import StaticFiles  # <--- nuevo
from pathlib import Path
import shutil

from app.api.scan import router as scan_router
from app.api.catalog import router as catalog_router
from app.api.stream import router as stream_router
from app.api.thumbs import router as thumbs_router
from app.api.transcode import router as transcode_router
from app.api.profiles import router as profiles_router
from app.api.progress import router as progress_router
from app.api.posters import router as posters_router

app = FastAPI(title="MediaHub LAN (Anime only)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # si luego usas cookies, cambia esto por orígenes explícitos
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Respuesta explícita al preflight de /api/profiles (evita 400 en algunas configs)
@app.options("/api/profiles")
def options_profiles():
    return Response(
        status_code=204,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Vary": "Origin",
        },
    )

# Monta ficheros estáticos: /static -> backend/media/
app.mount("/static", StaticFiles(directory="media"), name="static")  # <--- nuevo

@app.on_event("startup")
def seed_avatars_dir():
    media_dir = Path("media/avatars")         # se resuelve a /app/media/avatars
    seed_dir = Path("/app/assets/avatars")    # empaquetado en la imagen
    try:
        media_dir.mkdir(parents=True, exist_ok=True)
        if seed_dir.exists():
            # copiar los que no existan
            for f in seed_dir.iterdir():
                if f.is_file():
                    dest = media_dir / f.name
                    if not dest.exists():
                        shutil.copy2(f, dest)
    except Exception as e:
        # evita crash en arranque por un fallo de copia; registra si gestionas logs
        # print(f"[WARN] seed_avatars_dir: {e}")
        pass

@app.get("/health")
def health():
    return {"ok": True}


app.include_router(scan_router)
app.include_router(catalog_router)
app.include_router(stream_router)
app.include_router(thumbs_router)
app.include_router(transcode_router)
app.include_router(profiles_router)
app.include_router(progress_router)
app.include_router(posters_router)
