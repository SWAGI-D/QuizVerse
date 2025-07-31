import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Quiz {
  id: string;
  title: string;
}

interface QuizFromServer {
  id: string;
  title: string;
  code: string;
  createdAt: { seconds: number };
  questions: any[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const handleForum = () => navigate('/forum');

  useEffect(() => {
    const host = JSON.parse(localStorage.getItem('hostInfo') || '{}');
    if (!host?.uid) return;

    const fetchQuizzes = async () => {
      try {
        const res = await axios.get<QuizFromServer[]>(`http://localhost:5000/quizzes/host/${host.uid}`);

        const quizzes = res.data.map((q) => ({
          id: q.id,
          title: q.title || 'Untitled Quiz',
        }));
        setRecentQuizzes(quizzes);
      } catch (err) {
        console.error('❌ Failed to fetch recent quizzes:', err);
      }
    };

    fetchQuizzes();
  }, []);

  const handleCreate = () => navigate('/host');

  // Updated: Navigate to template gallery on button click
  const handleTemplate = () => navigate('/templates');

   const handleVideo = () => navigate('/video');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold text-center text-pink-400">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          <button
            onClick={handleCreate}
            className="bg-pink-500 hover:bg-pink-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
          >
            ➕ Create your own Quiz
          </button>
          <button
            onClick={handleTemplate}
            className="bg-emerald-500 hover:bg-emerald-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
          >
            📋 Choose a Template
          </button>

          <button
  onClick={handleForum}
  className="bg-indigo-500 hover:bg-indigo-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
>
  💬 View Forum Posts
</button>

          <button
            onClick={handleVideo}
            className="bg-emerald-500 hover:bg-emerald-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
          >
            📋 Quiz Video - Coming Soon
          </button>

        </div>

        {/* Recent Quizzes */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Quizzes</h2>

          {recentQuizzes.length === 0 ? (
            <p className="text-gray-300 italic">No quizzes</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/10 p-4 rounded-xl text-center shadow hover:scale-105 transition"
                >
                  <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        console.log('Previewing quiz:', quiz.id);
                        navigate(`/host/preview/${quiz.id}`);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                    >
                      👁️ Preview
                    </button>
                   
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`http://localhost:5000/quizzes/${quiz.id}`);
                          setRecentQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
                        } catch (err) {
                          console.error('❌ Failed to delete quiz:', err);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
