import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Toast from './Toast';

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
      .then(res => setScores(res.data))
      .catch(err => console.error('❌ Error fetching scoreboard:', err));
  }, [gameCode]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-500 text-white px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-8 drop-shadow-lg">🏆 Final Scoreboard</h1>

      <div className="w-full max-w-xl bg-purple-900/30 p-6 rounded-2xl shadow-lg space-y-4">
        {scores.map((p, i) => (
          <div
            key={p.id}
            className={`flex justify-between items-center p-4 rounded-xl transition ${
              i === 0
                ? 'bg-purple-700'
                : i === 1
                ? 'bg-purple-800'
                : i === 2
                ? 'bg-purple-600'
                : 'bg-purple-900/50'
            }`}
          >
            <div className="flex items-center gap-4">
              {i < 3 && <span className="text-2xl">{medals[i]}</span>}
              <span className="flex items-center gap-2 text-lg">
                {p.avatar} {p.name}
              </span>
            </div>
            <span className="text-2xl font-bold">{p.score} pts</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-6">
        <button
          onClick={() => navigate('/')}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-semibold"
        >
          🔁 Play Again
        </button>
        <button
          onClick={() => {
            setToast({ message: 'Exiting to Dashboard...', type: 'info' });
            setTimeout(() => {
              setToast(null);
              navigate('/dashboard');
            }, 2000);
          }}
          className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full font-semibold"
        >
          🚪 Exit
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
