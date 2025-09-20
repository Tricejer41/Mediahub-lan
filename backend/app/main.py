from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- nuevo
from app.api.scan import router as scan_router
from app.api.catalog import router as catalog_router

app = FastAPI(title="MediaHub LAN (Anime only)")

# Permite llamadas desde tu Next en dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.25:3000"],  # cambia si tu IP cambia
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(scan_router)
app.include_router(catalog_router)
