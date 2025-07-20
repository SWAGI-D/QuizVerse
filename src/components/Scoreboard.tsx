// src/components/Scoreboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from './Toast';
import axios from 'axios';

interface PlayerScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export default function Scoreboard() {
  const navigate = useNavigate();
  const { gameCode } = useParams<{ gameCode: string }>();
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    axios
      .get<PlayerScore[]>(`http://localhost:5000/scoreboard/${gameCode}`)
      .then((res) => setScores(res.data))
      .catch((err) => {
        console.error('❌ Error fetching scoreboard:', err);
        setToast({ message: 'Failed to load scoreboard', type: 'error' });
      });
  }, [gameCode]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12 font-poppins flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">🏆 Final Scoreboard</h1>

      <div className="w-full max-w-2xl space-y-4">
        {scores.map((p, idx) => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-6 py-4 rounded-xl shadow-lg transition
              ${
                idx === 0
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : idx === 1
                  ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                  : idx === 2
                  ? 'bg-gradient-to-r from-yellow-200 to-pink-400'
                  : 'bg-white/10'
              }`}
          >
            <div className="text-lg font-semibold flex items-center gap-3">
              {idx < 3 && <span className="text-2xl">{medals[idx]}</span>}
              {p.avatar.startsWith('http') ? (
                <img src={p.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <span className="text-2xl">{p.avatar}</span>
              )}
              {p.name}
            </div>
            <div className="text-xl font-bold">{p.score} pts</div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex gap-6">
        <button
          onClick={() => navigate('/')}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 text-white rounded-full text-lg shadow transition"
        >
          🔁 Play Again
        </button>
        <button
          onClick={() => {
            setToast({ message: 'Exiting to Dashboard...', type: 'info' });
            setTimeout(() => {
              setToast(null);
              navigate('/dashboard');
            }, 1000);
          }}
          className="bg-red-500 hover:bg-red-600 px-6 py-3 text-white rounded-full text-lg shadow transition"
        >
          🚪 Exit
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
