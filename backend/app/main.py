from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.scan import router as scan_router
from app.api.catalog import router as catalog_router
from app.api.stream import router as stream_router   # <--- añade esto

app = FastAPI(title="MediaHub LAN (Anime only)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.25:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(scan_router)
app.include_router(catalog_router)
app.include_router(stream_router)                     # <--- y esta línea
