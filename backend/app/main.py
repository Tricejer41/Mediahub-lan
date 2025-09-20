from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <--- nuevo

from app.api.scan import router as scan_router
from app.api.catalog import router as catalog_router
from app.api.stream import router as stream_router
from app.api.thumbs import router as thumbs_router

app = FastAPI(title="MediaHub LAN (Anime only)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.25:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# Monta ficheros estáticos: /static -> backend/media/
app.mount("/static", StaticFiles(directory="media"), name="static")  # <--- nuevo

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(scan_router)
app.include_router(catalog_router)
app.include_router(stream_router)
app.include_router(thumbs_router)
