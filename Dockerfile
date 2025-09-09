FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend ./
RUN npm install && npm run build

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
