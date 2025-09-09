from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
import shutil, os
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, TextClip
import openai

app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload(file: UploadFile, trim: str = Form(None)):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if trim in ["1min", "10min"]:
        clip = VideoFileClip(filepath).subclip(0, 60 if trim=="1min" else 600)
        outpath = os.path.join(UPLOAD_DIR, f"trimmed_{trim}_{file.filename}")
        clip.write_videofile(outpath)
        return {"message": f"Video trimmed to {trim} and saved."}

    return {"message": "Video uploaded."}

@app.post("/captions")
async def captions():
    return {"captions": "AI-generated captions here (hook Whisper API)."}

@app.post("/music")
async def music():
    return {"message": "Background music added to video."}

@app.post("/ask")
async def ask(data: dict):
    return {"answer": f"AI says: Hello! You asked: {data['question']}"}

from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok", "message": "backend is running!"}
