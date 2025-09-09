import React, { useState } from "react";
import axios from "axios";

function App() {
  const [video, setVideo] = useState(null);
  const [assistantResponse, setAssistantResponse] = useState("");

  const uploadVideo = async (trimType) => {
    if (!video) return alert("Upload a video first!");
    const formData = new FormData();
    formData.append("file", video);
    if (trimType) formData.append("trim", trimType);
    const res = await axios.post("/upload", formData);
    alert(res.data.message);
  };

  const generateCaptions = async () => {
    const res = await axios.post("/captions");
    alert("Captions: " + res.data.captions);
  };

  const addMusic = async () => {
    const res = await axios.post("/music");
    alert(res.data.message);
  };

  const askAI = async () => {
    const res = await axios.post("/ask", { question: "Hello AI!" });
    setAssistantResponse(res.data.answer);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
      <div className="bg-gray-900 bg-opacity-80 p-8 rounded-2xl shadow-lg w-full max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold mb-6">🎬 Video AI Studio</h1>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
        />

        {video && (
          <p className="text-sm text-green-400">✅ Loaded: {video.name}</p>
        )}

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button onClick={() => uploadVideo("1min")} className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold">Trim to 1 min</button>
          <button onClick={() => uploadVideo("10min")} className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold">Trim to 10 min</button>
          <button onClick={generateCaptions} className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold">Generate Captions</button>
          <button onClick={addMusic} className="px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 font-semibold">Add Music</button>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-2">🤖 Ask AI Assistant</h2>
          <button onClick={askAI} className="mt-3 px-4 py-2 bg-green-600 rounded-xl hover:bg-green-500 font-semibold">Ask Example</button>
          {assistantResponse && <p className="mt-4 text-gray-300">{assistantResponse}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
