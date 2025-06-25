import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface PlayerScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

const PlayerScoreboard: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
         const res = await axios.get(`http://localhost:5000/scoreboard/${gameCode}`);
        setScores(res.data as PlayerScore[]);
      } catch (err) {
        console.error('Error fetching scoreboard:', err);
      }
    };

    fetchScoreboard();
  }, [gameCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide text-center drop-shadow-lg">🏆 Final Scoreboard</h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <ul className="divide-y divide-gray-300">
          {scores.map((p, i) => (
            <li
              key={p.id}
              className={`flex justify-between items-center px-6 py-4 text-gray-800 font-semibold text-lg ${
                i === 0 ? 'bg-yellow-100' : i === 1 ? 'bg-gray-100' : i === 2 ? 'bg-orange-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{i + 1}</span>
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </div>
              <div className="text-xl font-bold">{p.score} pts</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerScoreboard;
