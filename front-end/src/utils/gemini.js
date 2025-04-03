import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export const generateText = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating response:", error);
        return "Failed to generate response.";
    }
};
