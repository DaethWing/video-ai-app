# ---------- Build Frontend ----------
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install --legacy-peer-deps
RUN npm run build

# ---------- Backend ----------
FROM python:3.11-slim
WORKDIR /app

# System dependencies for moviepy + ffmpeg
RUN apt-get update && apt-get install -y ffmpeg imagemagick && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
# 🔑 Force full moviepy install
RUN pip install --no-cache-dir "moviepy[optional]==1.0.3"

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend code
COPY . .

# Health check endpoint port
EXPOSE 10000

# Run FastAPI app with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
