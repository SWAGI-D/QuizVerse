// src/components/HeroSection.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection(): React.JSX.Element {
  console.log("Hero");
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden flex items-center justify-center px-8 md:px-16">
      
      {/* Stars / Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:20px_20px] opacity-20 pointer-events-none z-0" />

      {/* Decorative blob shape */}
      <div className="absolute right-[-100px] top-[20%] w-[700px] h-[500px] bg-gradient-to-br from-pink-600/30 to-purple-700/40 blur-[100px] rounded-[60%] z-0" />

      {/* Main content layout */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* LEFT: Heading + Buttons */}
        <motion.div
          className="text-left max-w-xl space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow">
            Welcome to <span className="text-pink-400">QuizVerse</span>
          </h1>
          <p className="text-lg text-gray-300">
            A fast-paced quiz showdown where speed and smarts win. Join or host a game to get started!
          </p>
          <div className="flex gap-4 pt-4">

           <Link to="/join">
          <button className="bg-pink-500 hover:bg-pink-600 transition text-white font-semibold py-3 px-6 rounded-full shadow-lg">
            Join Game
          </button>
          </Link>
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 px-6 rounded-full shadow-lg">
              Host Game
            </button>
          </Link>
          </div>
        </motion.div>

        {/* RIGHT: Floating card icons */}
        <motion.div
          className="relative flex flex-col gap-6 items-center justify-center w-full md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="bg-[#1e1b4b]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl text-2xl text-center w-48"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            ❓<div className="text-sm mt-2">Quiz Type</div>
          </motion.div>
          
          <motion.div
            className="bg-[#3f1d38]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl text-2xl text-center w-48 absolute top-18 left-2"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
          >
            ❌<div className="text-sm mt-2">Wrong Answer</div>
          </motion.div>

          <motion.div
            className="bg-[#1b4332]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl text-2xl text-center w-48 absolute bottom-0 right-0"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            ✅<div className="text-sm mt-2">Correct Answer</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}