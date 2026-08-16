FROM python:3.12-slim

# ffmpeg is required for pydub to decode WebM/Opus audio from MediaRecorder
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render provides $PORT at runtime; gunicorn binds to it
CMD gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120