# MediaHub LAN (MVP)
Objetivo: catálogo y reproducción en LAN de la carpeta /mnt/wd/Anime (Direct Play).

## Arranque rápido
- Backend: FastAPI en `:8000` (uvicorn --reload)
- Frontend: Next.js en `:3000` (npm run dev)
- Rutas de medios: `MEDIA_SERIES=/mnt/wd/Anime`

## Estructura
mediahub/
  backend/
    app/
      api/              # Endpoints (más adelante)
      services/         # scanner, stream, thumbnails
      core/             # config, db
      main.py           # FastAPI app
    alembic/            # Migraciones (Fase 4)
    tests/
  frontend/             # Next.js (Fase 3)
  docker/               # Compose y nginx (Fase 10)
  .env / .env.example   # Variables
  Makefile              # Atajos dev
