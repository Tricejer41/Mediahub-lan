from fastapi import FastAPI

app = FastAPI(title="MediaHub LAN (Anime only)")

@app.get("/health")
def health():
    return {"ok": True}
