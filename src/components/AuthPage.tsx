import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur p-8 rounded-xl shadow-xl">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              mode === 'login' ? 'bg-pink-500' : 'bg-white/20'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              mode === 'signup' ? 'bg-pink-500' : 'bg-white/20'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
