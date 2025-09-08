import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [video, setVideo] = useState(null);
  const [duration, setDuration] = useState("1");
  const [processedUrl, setProcessedUrl] = useState("");
  const [captions, setCaptions] = useState("");

  const askAI = async () => {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  const uploadVideo = async () => {
    const formData = new FormData();
    formData.append("video", video);
    formData.append("duration", duration);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setProcessedUrl(data.url);
  };

  const generateCaptions = async () => {
    const formData = new FormData();
    formData.append("video", video);

    const res = await fetch("/api/captions", { method: "POST", body: formData });
    const data = await res.json();
    setCaptions(data.captions);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <h1 className="text-4xl font-bold mb-6">🎬 Video AI Studio</h1>

      {/* AI Assistant */}
      <div className="bg-gray-800 p-6 rounded-xl w-1/2 mb-6">
        <h2 className="text-2xl mb-4">🤖 Ask AI</h2>
        <input
          type="text"
          placeholder="Ask me anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <button onClick={askAI} className="mt-4 bg-purple-600 hover:bg-purple-800 px-6 py-2 rounded-lg shadow-lg">
          Ask AI
        </button>
        {answer && <p className="mt-4">{answer}</p>}
      </div>

      {/* Video Upload */}
      <div className="bg-gray-800 p-6 rounded-xl w-1/2 mb-6">
        <h2 className="text-2xl mb-4">📤 Upload Video</h2>
        <input type="file" accept="video/mp4" onChange={(e) => setVideo(e.target.files[0])} />
        <select value={duration} onChange={(e) => setDuration(e.target.value)} className="ml-4 p-2 text-black rounded">
          <option value="1">1 Minute</option>
          <option value="10">10 Minutes</option>
        </select>
        <button onClick={uploadVideo} className="mt-4 bg-green-600 hover:bg-green-800 px-6 py-2 rounded-lg shadow-lg">
          Process Video
        </button>
        {processedUrl && (
          <video src={processedUrl} controls className="mt-4 w-full rounded-lg"></video>
        )}
      </div>

      {/* Captions */}
      <div className="bg-gray-800 p-6 rounded-xl w-1/2">
        <h2 className="text-2xl mb-4">📝 Generate Captions</h2>
        <button onClick={generateCaptions} className="bg-blue-600 hover:bg-blue-800 px-6 py-2 rounded-lg shadow-lg">
          Generate Captions
        </button>
        {captions && <p className="mt-4 whitespace-pre-wrap">{captions}</p>}
      </div>
    </div>
  );
}

export default App;
