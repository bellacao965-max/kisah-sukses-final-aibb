import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
const MODEL = process.env.MODEL || "gpt-4o-mini";

if (!OPENAI_KEY) {
  console.warn("Warning: OPENAI_API_KEY (or GROQ_API_KEY) is not set. AI endpoint will return a placeholder response.");
}

async function callOpenAI(prompt, model){
  if (!OPENAI_KEY) {
    return "AI key not configured. Set OPENAI_API_KEY or GROQ_API_KEY to get real responses.";
  }
  // Prefer OpenAI if OPENAI_API_KEY present
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No reply";
  } else {
    // Simple GROQ fallback using fetch to a hypothetical endpoint (user's Groq SDK may differ)
    // For now assume GROQ_API behaves like OpenAI-compatible. If not, user should replace with Groq SDK calls.
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No reply";
  }
}

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    const reply = await callOpenAI(prompt, model);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI Error", detail: err.message });
  }
});

// Simple quotes endpoint
const QUOTES = [
  "Jangan menyerah — langkah kecil hari ini adalah kemenangan besar esok.",
  "Kesuksesan datang kepada mereka yang tak takut mencoba lagi.",
  "Dream big. Work hard. Stay humble.",
  "Belajar dari kemarin, hidup untuk hari ini, berharap untuk besok.",
  "Kerja keras + konsistensi = hasil."
];

app.get("/api/quote", (req, res) => {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  res.json({ quote: q });
});

// Social/share helper (returns share URLs)
app.post("/api/social", (req, res) => {
  const { platform, text, url } = req.body;
  if (!platform) return res.status(400).json({ error: "Missing platform" });
  const encodedText = encodeURIComponent(text || "");
  const encodedUrl = encodeURIComponent(url || "");
  let shareUrl = "";
  switch ((platform+"").toLowerCase()) {
    case "facebook":
    case "fb":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case "instagram":
    case "ig":
      // Instagram web doesn't support direct posts; open Instagram home
      shareUrl = `https://www.instagram.com/`;
      break;
    case "tiktok":
      shareUrl = `https://www.tiktok.com/search?q=${encodedText}`;
      break;
    default:
      shareUrl = url || "";
  }
  res.json({ shareUrl });
});

app.use(express.static("./"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server RUNNING on port " + PORT));
