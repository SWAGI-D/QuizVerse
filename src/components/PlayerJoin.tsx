import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlayerJoin() {
  // Player input states
  const [name, setName] = useState<string>('');
  const [gameCode, setGameCode] = useState<string>('');
  const [avatarType, setAvatarType] = useState<'emoji' | 'dicebear'>('emoji');
  const [emojiAvatar, setEmojiAvatar] = useState<string>('😎');

  const emojis: string[] = ['😎', '🐱', '🐶', '👾', '🐸', '🦊', '🧙‍♂️', '👩‍🚀'];
  const navigate = useNavigate();

  // Join button handler
  const handleJoin = async () => {
  if (!name || !gameCode) {
    alert('Please enter name and game code');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        gameCode,
        avatar:
          avatarType === 'emoji'
            ? emojiAvatar
            : `https://api.dicebear.com/6.x/thumbs/svg?seed=${name || 'player'}`,
      }),
    });

    if (!res.ok) throw new Error('Failed to join game');

    const playerData = await res.json();
    localStorage.setItem('playerInfo', JSON.stringify(playerData));
    navigate(`/player-lobby/${gameCode}`);
  } catch (err) {
    console.error('Join error:', err);
    alert('Failed to join game. Try again.');
  }
};


  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:20px_20px] opacity-20 pointer-events-none z-0" />
      <div className="absolute right-[-120px] top-[20%] w-[700px] h-[500px] bg-gradient-to-br from-pink-600/30 to-purple-700/40 blur-[100px] rounded-[60%] z-0" />

      <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-white/10">
        <h1 className="text-3xl font-bold mb-6 text-pink-400">🎮 Join the Game</h1>

        <input
          type="text"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full mb-4 p-3 rounded-xl bg-white/10 text-white placeholder:text-gray-300 border border-white/20"
        />

        <input
          type="text"
          value={gameCode}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setGameCode(e.target.value.toUpperCase())}
          placeholder="Enter game code"
          className="w-full mb-6 p-3 rounded-xl bg-white/10 text-white placeholder:text-gray-300 border border-white/20"
        />

        <div className="mb-6 text-sm text-gray-300">
          <label className="block mb-2 font-semibold text-pink-300">Choose avatar type:</label>
          <div className="flex justify-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="avatarType"
                value="emoji"
                checked={avatarType === 'emoji'}
                onChange={() => setAvatarType('emoji')}
              />
              Emoji
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="avatarType"
                value="dicebear"
                checked={avatarType === 'dicebear'}
                onChange={() => setAvatarType('dicebear')}
              />
              Dicebear
            </label>
          </div>
        </div>

        {avatarType === 'emoji' && (
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setEmojiAvatar(emoji)}
                className={`text-3xl p-2 rounded-xl border-2 transition hover:scale-110 ${
                  emojiAvatar === emoji
                    ? 'bg-pink-500 border-pink-300'
                    : 'bg-white/10 border-transparent'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <p className="text-gray-300 mb-2">Preview:</p>
        {avatarType === 'emoji' ? (
          <div className="text-5xl mb-6">{emojiAvatar}</div>
        ) : (
          <img
            src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${name || 'player'}`}
            alt="avatar"
            className="w-20 h-20 rounded-full mx-auto mb-6"
          />
        )}

        <button
          onClick={handleJoin}
          className="bg-pink-500 hover:bg-pink-600 transition hover:scale-105 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg"
        >
          🚀 Join Game
        </button>
      </div>
    </div>
  );
}
