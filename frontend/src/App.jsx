import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [captions, setCaptions] = useState("");
  const [assistantReply, setAssistantReply] = useState("");

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:10000"
      : "";

  const handleUpload = async (duration) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("duration", duration);

    const res = await fetch(`${API_BASE}/upload/`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setVideoUrl(data.video_url);
  };

  const handleCaption = async () => {
    const formData = new FormData();
    formData.append("prompt", "My uploaded video");

    const res = await fetch(`${API_BASE}/caption/`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setCaptions(data.captions);
  };

  const handleAssistant = async (q) => {
    const formData = new FormData();
    formData.append("query", q);

    const res = await fetch(`${API_BASE}/assistant/`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAssistantReply(data.answer);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="bg-black bg-opacity-60 p-6 rounded-2xl space-y-4 w-[600px]">
        <h1 className="text-3xl font-bold">🎬 Video AI Studio</h1>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <div className="flex space-x-2">
          <button onClick={() => handleUpload("1m")}>Upload 1m</button>
          <button onClick={() => handleUpload("10m")}>Upload 10m</button>
        </div>
        {videoUrl && (
          <video src={videoUrl} controls className="w-full rounded-xl"></video>
        )}
        <button onClick={handleCaption}>Generate Captions</button>
        {captions && <p>{captions}</p>}
        <input
          type="text"
          placeholder="Ask assistant..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAssistant(e.target.value);
          }}
        />
        {assistantReply && <p>{assistantReply}</p>}
      </div>
    </div>
  );
}
