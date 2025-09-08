import os, shutil, tempfile
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
import openai

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
FRONTEND_DIR = "frontend/dist"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

openai.api_key = os.getenv("OPENAI_API_KEY", "")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

@app.post("/prepare_video/")
async def prepare_video(
    file: UploadFile,
    duration: int = Form(60),
    captions: bool = Form(False)
):
    in_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(in_path, "wb") as f: shutil.copyfileobj(file.file, f)

    try:
        clip = VideoFileClip(in_path).subclip(0, min(duration, int(VideoFileClip(in_path).duration)))

        if captions and openai.api_key:
            tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            clip.audio.write_audiofile(tmp_audio.name)
            with open(tmp_audio.name, "rb") as a:
                result = openai.Audio.transcriptions.create(model="whisper-1", file=a)
            caption_text = result.text

            txt = TextClip(caption_text, fontsize=32, color="white", bg_color="black", size=(clip.w, None))
            txt = txt.set_position(("center", clip.h - 60)).set_duration(clip.duration)
            clip = CompositeVideoClip([clip, txt])

        out_path = os.path.join(PROCESSED_DIR, f"{file.filename}_final.mp4")
        clip.write_videofile(out_path, codec="libx264", audio_codec="aac")

    except Exception as e:
        raise HTTPException(500, f"Video processing failed: {e}")

    return {"final": f"/{out_path}"}

@app.post("/chat_ai/")
async def chat_ai(prompt: str = Form(...)):
    if not openai.api_key: return {"reply": "Set OPENAI_API_KEY"}
    res = openai.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"user","content":prompt}])
    return {"reply": res.choices[0].message.content}

@app.get("/health")
def health(): return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
