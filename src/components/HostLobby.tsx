import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Params {
  gameCode: string;
}

export default function HostLobby() {
  const { gameCode } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]); // players is an array of strings

  // Simulate fake player joins
  useEffect(() => {
    const fakePlayers = ['Alice', 'Bob', 'Charlie', 'David'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < fakePlayers.length) {
        setPlayers(prev => [...prev, fakePlayers[i++]]);
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Copy game code to clipboard
  const copyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      alert('Game code copied!');
    }
  };

  // Start quiz by navigating to first question screen
  const handleStartGame = () => {
    if (gameCode) {
      navigate(`/host-game/${gameCode}/0`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-10 flex items-center justify-center">
      {/* Lobby Card */}
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-6">🎮 Host Lobby</h1>

        <p className="text-lg text-center mb-2">Share this game code with players:</p>
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="bg-white text-black text-2xl font-bold px-6 py-2 rounded-xl shadow-inner">
            {gameCode}
          </div>
          <button
            onClick={copyCode}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition"
          >
            📋 Copy
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-4">👥 Players Joined</h2>
        {players.length === 0 ? (
          <p className="text-center text-gray-300 animate-pulse">Waiting for players to join...</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {players.map((player, idx) => (
              <li
                key={idx}
                className="bg-white/20 p-4 rounded-xl text-center font-semibold text-white shadow hover:scale-105 transition"
              >
                🧑 {player}
              </li>
            ))}
          </ul>
        )}

        {/* Start Game Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handleStartGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-10 py-3 rounded-full shadow-xl transition transform hover:scale-105"
          >
            ▶️ Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
