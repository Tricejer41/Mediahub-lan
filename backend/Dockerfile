# backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ffmpeg para thumbnails/posters/transcode
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements primero para cache
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# código
COPY app /app/app
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini
COPY media/avatars /app/assets/avatars

# carpeta media (thumbnails/posters/avatars); será montada como volumen
RUN mkdir -p /app/media/avatars /app/media/posters /app/media/thumbs

EXPOSE 8000
CMD ["uvicorn", "--app-dir", "/app", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
