# ---------- Build Frontend ----------
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install --legacy-peer-deps
RUN npm run build

# ---------- Backend ----------
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build into backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend code
COPY . .

EXPOSE 10000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
