# ---------- Frontend Build ----------
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install --legacy-peer-deps
RUN npm run build

# ---------- Backend ----------
FROM python:3.11-slim
WORKDIR /app

# System dependencies (moviepy needs ffmpeg + ImageMagick)
RUN apt-get update && apt-get install -y \
    ffmpeg imagemagick build-essential gfortran \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps safely
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
# ✅ Preinstall numpy wheel first to avoid source build
RUN pip install --no-cache-dir "numpy==1.26.4"
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "moviepy==1.0.3"

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend
COPY . .

EXPOSE 10000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
