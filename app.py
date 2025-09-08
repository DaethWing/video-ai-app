import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from moviepy.editor import VideoFileClip
import openai

app = FastAPI()

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.post("/upload/")
async def upload_video(file: UploadFile, duration: str = Form("10m")):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    clip = VideoFileClip(filepath)
    max_duration = 60 if duration == "1m" else 600
    trimmed = clip.subclip(0, min(max_duration, clip.duration))
    output_path = filepath.replace(".mp4", "_trimmed.mp4")
    trimmed.write_videofile(output_path)

    return {"video_url": f"/download/{os.path.basename(output_path)}"}

@app.get("/download/{filename}")
async def download_file(filename: str):
    return FileResponse(os.path.join(UPLOAD_DIR, filename))

@app.post("/caption/")
async def generate_captions(prompt: str = Form(...)):
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a video captioning AI."},
                  {"role": "user", "content": f"Generate captions for: {prompt}"}]
    )
    return {"captions": response.choices[0].message.content}

@app.post("/assistant/")
async def assistant(query: str = Form(...)):
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": query}]
    )
    return {"answer": response.choices[0].message.content}
