import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Quiz {
  id: string;
  title: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);

  // Load recent quizzes from localStorage (or mock for now)
  useEffect(() => {
    const stored = localStorage.getItem('recentQuizzes');
    if (stored) {
      setRecentQuizzes(JSON.parse(stored));
    } else {
      setRecentQuizzes([]); // or mock: [{ id: '1', title: 'Quiz 1' }]
    }
  }, []);

  const handleCreate = () => navigate('/create-quiz');
  const handleTemplate = () => navigate('/template-gallery');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-pink-400">Dashboard</h1>

        {/* Top Action Buttons */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
  <button
    onClick={() => navigate('/host')} // ← navigates to quiz form dashboard
    className="bg-pink-500 hover:bg-pink-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
  >
    ➕ Create your own Quiz
  </button>
  <button
    onClick={() => navigate('/template-gallery')}
    className="bg-emerald-500 hover:bg-emerald-600 p-6 rounded-xl font-bold text-lg shadow-md transition"
  >
    📋 Choose a Template
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
                  className="bg-white/10 p-4 rounded-xl text-center shadow hover:scale-105 transition cursor-pointer"
                  onClick={() => navigate(`/host-lobby/${quiz.id}`)}
                >
                  <h3 className="text-xl font-semibold">{quiz.title}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
