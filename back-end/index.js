import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data"; // Import FormData for multipart requests
import fs from 'fs'; // Import fs for file system operations

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STABILITY_API_KEY_IMAGE_GENERATION = process.env.STABILITY_API_KEY_IMAGE_GENERATION; // Fix: Define OpenAI API key

// 🔹 Text/Blog Generation using Google Gemini
app.post("/generate", async (req, res) => {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Input is required" });

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
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

// 🔹 Image Generation using OpenAI DALL·E 2
app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("width", "1024");
        formData.append("height", "1024");
        formData.append("output_format", "jpeg");

        console.log(" Sending request to Stability AI...");

        const response = await axios.post(
            "https://api.stability.ai/v2beta/stable-image/generate/sd3", // Verify this endpoint
            formData,
            {
                headers: {
                    Authorization: `Bearer ${STABILITY_API_KEY_IMAGE_GENERATION}`,
                    Accept: "image/*",
                    ...formData.getHeaders(),
                },
                responseType: "arraybuffer", 
            }
        );

        console.log("✅ Stability AI Response Headers:", response.headers);

        // Save the binary image data as a file or convert it to base64
        const imageBase64 = Buffer.from(response.data, "binary").toString("base64");
        res.json({ imageUrl: `data:image/jpeg;base64,${imageBase64}` });

    } catch (error) {
        console.error("❌ Stability AI Error:", error.response?.data || error.message);

        if (error.response) {
            const { status, data } = error.response;
            if (status === 401) {
                res.status(401).json({ error: "Invalid API Key. Please check your Stability AI API key." });
            } else if (status === 404) {
                res.status(404).json({ error: "API endpoint not found. Verify Stability AI API URL.", details: data });
            } else {
                res.status(status).json({ error: "Image generation failed", details: data });
            }
        } else {
            res.status(500).json({ error: "An unexpected error occurred", details: error.message });
        }
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
