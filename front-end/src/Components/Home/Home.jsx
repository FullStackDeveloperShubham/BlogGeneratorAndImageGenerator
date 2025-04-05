import { useState } from "react";
import axios from "axios";

const Home = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!input.trim()) return;
        
        setLoading(true);
        setResponse("Generating response...");
        setImageUrl(""); // Clear previous image
        
        try {/*  */
            // Fetch text/blog response
            const textResponse = await axios.post("https://thedigitalshift-assignment.onrender.com/generate", { input });
            setResponse(textResponse.data.response);

            // Fetch AI-generated image
            const imageResponse = await axios.post("https://thedigitalshift-assignment.onrender.com/generate-image", { prompt: input });
            setImageUrl(imageResponse.data.imageUrl);
            
        } catch (error) {
            setResponse("Failed to fetch response. Please try again.");
            console.error("Error:", error);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Generate Blog and Image</h2>

            {/* Textarea: Auto Expand but No Scroll Down */}
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-[80px] max-h-[150px] border border-gray-300 rounded-lg p-3 
                   focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none overflow-hidden"
                placeholder="Ask something..."
                rows={3}
                disabled={loading}
            />

            {/* Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300
                   ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600"}`}
            >
                {loading ? "Generating..." : "Generate Response"}
            </button>

            {/* Response Box: Fixed Height with Internal Scroll */}
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 h-[200px] overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{response || "Your response will appear here..."}</p>
            </div>

            {/* Image Section */}
            {imageUrl && (
                <div className="flex justify-center mt-4">
                    <img src={imageUrl} alt="Generated" className="w-1/2 rounded-lg border shadow-md" />
                </div>
            )}
        </div>
    );
};

export default Home;
