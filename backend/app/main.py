from fastapi import FastAPI
from app.api.scan import router as scan_router
from app.api.catalog import router as catalog_router

app = FastAPI(title="MediaHub LAN (Anime only)")

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(scan_router)
app.include_router(catalog_router)
