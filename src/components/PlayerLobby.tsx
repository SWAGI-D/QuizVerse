
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Define player structure
interface Player {
  name: string;
  gameCode: string;
  avatar: string;
}

export default function PlayerLobby() {
  const { gameCode } = useParams<Record<string, string>>();
  const [player, setPlayer] = useState<Player | null>(null);
const navigate = useNavigate();

  // Get player info from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('playerInfo');
    if (saved) {
      setPlayer(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
  if (!gameCode) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:5000/games/${gameCode}`);
      const data = await res.json();
      console.log('📡 Polled game state:', data); // 🔍 DEBUG

      if (data?.questionIndex !== undefined && data.questionIndex >= 0) {
        clearInterval(interval);
        navigate(`/player-game/${gameCode}`);
      }
    } catch (err) {
      console.error('❌ Failed to check game status:', err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [gameCode, navigate]);



  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Starry background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:20px_20px] opacity-20 pointer-events-none z-0" />

      {/* Blurred glowing shape */}
      <div className="absolute left-[-150px] bottom-[10%] w-[700px] h-[500px] bg-gradient-to-br from-pink-600/30 to-purple-700/40 blur-[100px] rounded-[60%] z-0" />

      {/* Lobby card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-white/10">
        <h1 className="text-3xl font-bold mb-4 text-pink-400">🚀 Waiting Lobby</h1>

        {/* Game code display */}
        <p className="text-sm text-gray-300 mb-2">Game Code:</p>
        <div className="text-2xl font-bold bg-white text-black px-4 py-2 inline-block rounded-lg mb-6">
          {gameCode}
        </div>

        {/* Player avatar + name */}
        {player && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-1">You joined as:</p>
              {player.avatar.startsWith('http') ? (
                <img
                  src={player.avatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-full mx-auto"
                />
              ) : (
                <div className="text-5xl">{player.avatar}</div>
              )}
              <p className="mt-2 font-bold text-lg">{player.name}</p>
            </div>
          </>
        )}

        {/* Waiting animation */}
        <div className="mt-6 animate-pulse text-gray-300 text-sm">
          ⏳ Waiting for host to start the game...
        </div>
      </div>
    </div>
  );
}
