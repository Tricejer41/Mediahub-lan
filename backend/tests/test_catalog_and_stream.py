import pytest
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

from app.main import app

@pytest.mark.asyncio
async def test_catalog_nonempty_and_series_detail_and_stream_range():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1) catálogo
            r = await ac.get("/api/catalog/series")
            assert r.status_code == 200
            series = r.json()
            assert isinstance(series, list)
            assert len(series) >= 1

            # 2) detalle de la primera serie
            sid = series[0]["id"]
            r = await ac.get(f"/api/catalog/series/{sid}")
            assert r.status_code == 200
            detail = r.json()
            assert "seasons" in detail and isinstance(detail["seasons"], list)

            # 3) localiza un episodio
            ep_id = None
            for s in detail["seasons"]:
                if s["episodes"]:
                    ep_id = s["episodes"][0]["id"]
                    break
            assert ep_id is not None, "No se encontraron episodios en la serie seleccionada"

            # 4) range request (1 KB)
            r = await ac.get(f"/api/stream/{ep_id}", headers={"Range": "bytes=0-1023"})
            assert r.status_code in (200, 206)
            assert r.headers.get("content-type", "").startswith(("video/", "application/octet-stream"))
