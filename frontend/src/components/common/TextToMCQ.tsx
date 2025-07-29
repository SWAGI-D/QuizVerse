import React, { useState } from 'react';

const TextToMCQ: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [mcqRaw, setMcqRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setMcqRaw('');

    try {
      const response = await fetch('http://localhost:5000/generate-mcqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (response.ok) {
        setMcqRaw(data.mcq_raw);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-pink-400">Text to MCQ Generator</h1>

        <textarea
          className="w-full bg-white/10 text-white border border-white/20 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300"
          rows={8}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your topic or textbook content here..."
        />

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : '🚀 Generate MCQs'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-center text-lg font-medium">{error}</div>
        )}

        {mcqRaw && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 mt-6 text-white whitespace-pre-wrap text-lg shadow-md">
            {mcqRaw}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToMCQ;
