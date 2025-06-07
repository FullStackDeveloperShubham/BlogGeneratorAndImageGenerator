import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname manually (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
  "origin":'http://localhost:5173'
}));
// app.use(express.json());

// ✅ API Endpoints

app.post("/generate", async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: input }] }],
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("width", "1024");
    formData.append("height", "1024");
    formData.append("output_format", "jpeg");

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.Hugging_Face_Ai_Image_Generation}`,
          Accept: "image/*",
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ imageUrl: `data:image/jpeg;base64,${imageBase64}` });

  } catch (error) {
    console.error("Hugging Face Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// ✅ Serve Frontend (Vite build output)
app.use(express.static(path.join(__dirname, "../front-end/dist")));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../front-end/dist/index.html"));
  });

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
