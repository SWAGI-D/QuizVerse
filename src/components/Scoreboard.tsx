import React from 'react';
import { useNavigate } from 'react-router-dom';

// Define player type
interface Player {
  name: string;
  score: number;
}

export default function Scoreboard() {
  const navigate = useNavigate();

  // 🧪 Fake final scores
  const players: Player[] = [
    { name: 'Alice', score: 150 },
    { name: 'Bob', score: 130 },
    { name: 'Charlie', score: 100 },
    { name: 'David', score: 90 },
  ];

  // Sort by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12 font-poppins flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">🏆 Final Scoreboard</h1>

      <div className="w-full max-w-2xl space-y-4">
        {sorted.map((player, idx) => (
          <div
            key={idx}
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
              {player.name}
            </div>
            <div className="text-xl font-bold">{player.score} pts</div>
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
          onClick={() => alert('Thanks for playing!')}
          className="bg-red-500 hover:bg-red-600 px-6 py-3 text-white rounded-full text-lg shadow transition"
        >
          🚪 Exit
        </button>
      </div>
    </div>
  );
}
