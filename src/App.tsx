import React, { useState } from 'react';
import { PenLine, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogResponse {
  title: string;
  content: string;
  images: string[];
}

function App() {
  const [wordCount, setWordCount] = useState<number>(500);
  const [subheadingsCount, setSubheadingsCount] = useState<number>(3);
  const [keywords, setKeywords] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [article, setArticle] = useState<BlogResponse | null>(null);
  const [error, setError] = useState<string>('');

  const generateArticle = async () => {
    setLoading(true);
    setError('');
    try {
      // Construct the correct Edge Function URL
      const functionUrl = new URL('/functions/v1/generate-blog', import.meta.env.VITE_SUPABASE_URL).toString();
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordCount,
          subheadingsCount,
          keywords: keywords.split(',').map(k => k.trim()),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-8">
          <PenLine className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Blog Generator</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="technology, artificial intelligence, future"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word Count
                </label>
                <input
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  max="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Subheadings
                </label>
                <input
                  type="number"
                  value={subheadingsCount}
                  onChange={(e) => setSubheadingsCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <button
              onClick={generateArticle}
              disabled={loading || !keywords.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Article'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
        </div>

        {article && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
            <div className="prose max-w-none">
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    <img className="w-full h-64 object-cover rounded-lg mb-6" {...props} />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;