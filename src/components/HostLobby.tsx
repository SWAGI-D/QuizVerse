import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Params {
  gameCode: string;
}

export default function HostLobby() {
  const { gameCode } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();

  interface Player {
  id: string;
  name: string;
  avatar: string;
}

const [players, setPlayers] = useState<Player[]>([]);
const [quizTitle, setQuizTitle] = useState('');


  // Simulate fake player joins
  useEffect(() => {
    const fetchQuizTitle = async () => {
  const gameRes = await fetch(`http://localhost:5000/games/${gameCode}`);
  const gameData = await gameRes.json();

  const quizRes = await fetch(`http://localhost:5000/quizzes/${gameData.quizId}`);
  const quiz = await quizRes.json();
  setQuizTitle(quiz.title);
};

fetchQuizTitle();

  const fetchPlayers = async () => {
    if (!gameCode) return;

    try {
      const res = await fetch(`http://localhost:5000/players/${gameCode}`);
      if (!res.ok) throw new Error('Failed to fetch players');
      const data = await res.json();
      setPlayers(data); // entire player object including avatar

    } catch (err) {
      console.error('Error loading players:', err);
    }
  };

  // Initial fetch
  fetchPlayers();

  // Poll every 3 seconds
  const interval = setInterval(fetchPlayers, 3000);
  return () => clearInterval(interval);
}, [gameCode]);


  // Copy game code to clipboard
  const copyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      alert('Game code copied!');
    }
  };

  // Start quiz by navigating to first question screen
const handleStartGame = async () => {
  if (!gameCode) return;

  try {
    await fetch(`http://localhost:5000/games/${gameCode}`, {
      method: 'PATCH', // <-- not PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIndex: 0, showScoreboard: false }),
    });

    navigate(`/host-game/${gameCode}/0`);
  } catch (err) {
    console.error('❌ Failed to start game:', err);
    alert('Error starting the game.');
  }
};


  const handleKick = async (id: string) => {
  try {
    await fetch(`http://localhost:5000/players/${id}`, {
      method: 'DELETE',
    });

    setPlayers(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    console.error('Error kicking player:', err);
    alert('Failed to remove player. Try again.');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-10 flex items-center justify-center">
      {/* Lobby Card */}
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-6">🎮 Host Lobby</h1>
        <h2 className="text-xl font-semibold mb-2 text-white">
  🧠 Hosting Quiz: <span className="text-yellow-300">{quizTitle}</span>
</h2>


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
  {players.map((player) => (
    <li
      key={player.id}
      className="bg-white/20 p-4 rounded-xl text-center font-semibold text-white shadow hover:scale-105 transition"
    >
      {player.avatar.startsWith('http') ? (
        <img
          src={player.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full mx-auto mb-2"
        />
      ) : (
        <div className="text-4xl mb-2">{player.avatar}</div>
      )}
      🧑 {player.name}
      <button
        onClick={() => handleKick(player.id)}
        className="text-xs text-red-400 hover:text-red-600 mt-1 block"
      >
        ❌ Kick
      </button>
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
