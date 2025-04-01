import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};


async function generateChatGPTResponse(prompt) {
  const OPENAI_API_KEY = "your-api-key-here"; // Replace with your actual OpenAI API key
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }], // OpenAI uses messages format
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Error generating content";
}

// Server handler function
const serve = (handler) => {
  return async (req) => handler(req);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { wordCount, subheadingsCount, keywords } = await req.json();

    // Validate input parameters
    if (!wordCount || !subheadingsCount || !keywords || !Array.isArray(keywords)) {
      throw new Error('Invalid input parameters');
    }

    // Generate article structure
    const structurePrompt = `Create a blog article structure with exactly ${subheadingsCount} subheadings about ${keywords.join(', ')}. Format as JSON with title and subheadings array.`;
    const structureResponse = await generateGeminiResponse(structurePrompt);
    const structure = JSON.parse(structureResponse);

    // Generate full article content
    const articlePrompt = `Write a blog article about ${keywords.join(', ')} with approximately ${wordCount} words. Use these subheadings: ${structure.subheadings.join(', ')}. Make it engaging and informative.`;
    const articleContent = await generateGeminiResponse(articlePrompt);

    const result = {
      title: structure.title,
      content: articleContent,
    };

    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in generate-blog function:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: corsHeaders }
    );
  }
});
