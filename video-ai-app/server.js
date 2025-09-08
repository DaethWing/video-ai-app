import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1gb" }));

// Upload setup
const upload = multer({ dest: "uploads/" });

// OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Mini AI Assistant
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for video editing." },
        { role: "user", content: question }
      ],
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ✅ Video upload + captions + music
app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    const { length } = req.body; // "short" or "long"
    const input = req.file.path;
    const base = Date.now();
    const trimmed = `processed/${base}_trimmed.mp4`;
    const captioned = `processed/${base}_captioned.mp4`;
    const final = `processed/${base}_final.mp4`;

    fs.mkdirSync("processed", { recursive: true });

    // Trim duration
    const duration = length === "short" ? 60 : 600;

    // ffmpeg retry helper
    const runFfmpeg = (cmd, retries = 3) => {
      return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
          if (err) {
            if (retries > 0) {
              console.log("Retrying:", cmd);
              resolve(runFfmpeg(cmd, retries - 1));
            } else {
              reject(err);
            }
          } else resolve();
        });
      });
    };

    // Step 1: Trim
    await runFfmpeg(`ffmpeg -y -i ${input} -t ${duration} -c copy ${trimmed}`);

    // Step 2: Generate captions text with AI
    const captions = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Generate concise captions for a video." },
        { role: "user", content: "Write engaging captions (subtitles) for a short video." }
      ],
    });
    const captionText = captions.choices[0].message.content
      .split("\n")
      .map((line, i) => `${i+1}\n00:00:${String(i).padStart(2,"0")},000 --> 00:00:${String(i+2).padStart(2,"0")},000\n${line}\n`)
      .join("\n");

    const srtFile = `processed/${base}.srt`;
    fs.writeFileSync(srtFile, captionText);

    // Burn captions
    await runFfmpeg(`ffmpeg -y -i ${trimmed} -vf subtitles=${srtFile} ${captioned}`);

    // Step 3: Add AI background music (just demo with stock mp3)
    const musicFile = "bg-music.mp3";
    if (!fs.existsSync(musicFile)) {
      fs.writeFileSync(musicFile, ""); // placeholder, replace with real track
    }
    await runFfmpeg(`ffmpeg -y -i ${captioned} -i ${musicFile} -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2" -c:v copy ${final}`);

    res.json({ success: true, url: `/processed/${path.basename(final)}` });
  } catch (err) {
    console.error("Video Error:", err);
    res.status(500).json({ error: "Video processing failed" });
  }
});

// Static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/processed", express.static(path.join(__dirname, "processed")));
app.use(express.static(path.join(__dirname, "frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
