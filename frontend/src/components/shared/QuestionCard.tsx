// import React from 'react';

// // Define the shape of a question - hello
// interface Question {
//   text: string;
//   type: 'mcq' | 'truefalse' | 'oneword';
//   options?: string[];
//   answer: string;
// }

// // Props for the QuestionCard
// interface QuestionCardProps {
//   question: Question;
//   timeLeft: number;
//   selectedAnswer: string | null;
//   onSelect: (value: string) => void;
//   score: number | null;
//   streak: number | null;
// }

// export default function QuestionCard({
//   question,
//   timeLeft,
//   selectedAnswer,
//   onSelect,
//   score,
//   streak
// }: QuestionCardProps) {
//   return (
//     <div className="w-full max-w-3xl mx-auto text-white font-poppins">
//       {/* Timer */}
//       <div className="text-center mb-4 text-lg font-semibold tracking-wider text-cyan-300">
//         TIME REMAINING: <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
//       </div>

//       {/* Question text */}
//       <h2 className="text-3xl text-center font-bold mb-10">
//         {question?.text || "Loading..."}
//       </h2>

//       {/* MULTIPLE CHOICE */}
//       {question?.type === 'mcq' && question.options && (
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           {question.options.map((opt, idx) => {
//             const isSelected = selectedAnswer === opt;

//             const gradientStyles = [
//               "from-green-400 to-green-600",
//               "from-pink-400 to-pink-600",
//               "from-blue-400 to-blue-600",
//               "from-yellow-400 to-yellow-500"
//             ];

//             return (
//               <button
//                 key={idx}
//                 onClick={() => onSelect(opt)}
//                 disabled={!!selectedAnswer}
//                 className={`w-full py-4 text-lg font-bold rounded-xl transition hover:scale-105 shadow-md text-white ${
//                   isSelected
//                     ? "bg-gray-800 ring-2 ring-white"
//                     : `bg-gradient-to-br ${gradientStyles[idx % 4]}`
//                 }`}
//               >
//                 {opt}
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {/* TRUE / FALSE */}
//       {question?.type === 'truefalse' && (
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           {['True', 'False'].map((opt) => {
//             const isSelected = selectedAnswer === opt;

//             const gradient =
//               opt === 'True'
//                 ? "from-green-400 to-green-600"
//                 : "from-red-400 to-red-600";

//             return (
//               <button
//                 key={opt}
//                 onClick={() => onSelect(opt)}
//                 disabled={!!selectedAnswer}
//                 className={`w-full py-4 text-lg font-bold rounded-xl transition hover:scale-105 shadow-md text-white ${
//                   isSelected
//                     ? "bg-gray-800 ring-2 ring-white"
//                     : `bg-gradient-to-br ${gradient}`
//                 }`}
//               >
//                 {opt}
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {/* ONE-WORD */}
//       {question?.type === 'oneword' && (
//         <div className="mb-8">
//           <input
//             type="text"
//             value={selectedAnswer || ''}
//             onChange={(e) => onSelect(e.target.value)}
//             disabled={!!selectedAnswer}
//             placeholder="Type your answer"
//             className="w-full p-4 rounded-xl bg-white/10 text-white placeholder:text-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
//           />
//         </div>
//       )}

//       {/* SCORE BAR */}
//       {score !== null && (
//         <div className="mb-6">
//           <p className="text-pink-300 font-bold mb-1">LIVE SCORE</p>
//           <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
//             <div
//               className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
//               style={{ width: `${Math.min(score, 100)}%` }}
//             />
//           </div>

//           <div className="flex justify-between mt-2 px-2 text-2xl animate-bounce">
//             <span>🎉</span>
//             <span>👏</span>
//             <span>🙌</span>
//           </div>
//         </div>
//       )}

//       {/* STREAK DISPLAY */}
//       {streak !== null && streak > 1 && (
//         <div className="text-center mt-6 text-yellow-300 text-2xl font-bold animate-pulse flex flex-col items-center gap-2">
//           {streak}x STREAK! 🔥
//           <div className="flex gap-4 text-3xl animate-bounce">
//             <span>💥</span>
//             <span>🎯</span>
//             <span>🎉</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React from 'react';

interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword' | 'selectall' | 'match';
  options?: string[];
  answer: string | string[];
  timerInSeconds?: number;
  matchPairs?: MatchPair[];
}

interface QuestionCardProps {
  question: Question;
  timeLeft: number;
  selectedAnswer: string | string[] | null;
  onSelect: (value: string | string[]) => void;
  score: number | null;
  streak: number | null;
}

export default function QuestionCard({
  question,
  timeLeft,
  selectedAnswer,
  onSelect,
  score,
  streak
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto text-white font-poppins">
      {/* Timer */}
      <div className="text-center mb-4 text-lg font-semibold tracking-wider text-cyan-300">
        TIME REMAINING:{' '}
        <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
      </div>

      {/* Question text */}
      <h2 className="text-3xl text-center font-bold mb-10">
        {question?.text || 'Loading...'}
      </h2>

      {/* —————————————— MCQ —————————————— */}
      {question.type === 'mcq' && question.options && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const gradientStyles = [
              'from-green-400 to-green-600',
              'from-pink-400 to-pink-600',
              'from-blue-400 to-blue-600',
              'from-yellow-400 to-yellow-500'
            ];
            return (
              <button
                key={idx}
                onClick={() => onSelect(opt)}
                disabled={!!selectedAnswer}
                className={`w-full py-4 text-lg font-bold rounded-xl transition hover:scale-105 shadow-md text-white ${
                  isSelected
                    ? 'bg-gray-800 ring-2 ring-white'
                    : `bg-gradient-to-br ${gradientStyles[idx % 4]}`
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* ————————— True / False ————————— */}
      {question.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {['True', 'False'].map((opt) => {
            const isSelected = selectedAnswer === opt;
            const gradient =
              opt === 'True'
                ? 'from-green-400 to-green-600'
                : 'from-red-400 to-red-600';
            return (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                disabled={!!selectedAnswer}
                className={`w-full py-4 text-lg font-bold rounded-xl transition hover:scale-105 shadow-md text-white ${
                  isSelected
                    ? 'bg-gray-800 ring-2 ring-white'
                    : `bg-gradient-to-br ${gradient}`
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* ————————— One-Word ————————— */}
      {question.type === 'oneword' && (
        <div className="mb-8">
          <input
            type="text"
            value={selectedAnswer as string || ''}
            onChange={(e) => onSelect(e.target.value)}
            disabled={!!selectedAnswer}
            placeholder="Type your answer"
            className="w-full p-4 rounded-xl bg-white/10 text-white placeholder:text-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
      )}

      {/* —————— Select All That Apply —————— */}
      {question.type === 'selectall' && question.options && (
        <div className="mb-8">
          <p className="font-semibold mb-2">Select all that apply:</p>
          {question.options.map((opt, i) => {
            const selectedArr = Array.isArray(selectedAnswer) ? selectedAnswer : [];
            const checked = selectedArr.includes(opt);
            return (
              <label key={i} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  disabled={!!selectedAnswer}
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selectedArr.filter((o) => o !== opt)
                      : [...selectedArr, opt];
                    onSelect(next);
                  }}
                  className="mr-2 w-5 h-5 accent-cyan-400"
                />
                <span className="text-lg">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* —————— Match the Following —————— */}
      {question.type === 'match' && question.matchPairs && (
        <div className="mb-8">
          <p className="font-semibold mb-2">Match the following:</p>
          {question.matchPairs.map((pair, i) => (
            <div key={i} className="flex justify-between mb-2">
              <span className="px-4 py-2 bg-white/10 rounded-lg">{pair.left}</span>
              <span className="px-4 py-2 bg-white/10 rounded-lg">{pair.right}</span>
            </div>
          ))}
        </div>
      )}

      {/* ————————— Score Bar ————————— */}
      {score !== null && (
        <div className="mb-6">
          <p className="text-pink-300 font-bold mb-1">LIVE SCORE</p>
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 px-2 text-2xl animate-bounce">
            <span>🎉</span>
            <span>👏</span>
            <span>🙌</span>
          </div>
        </div>
      )}

      {/* —————— STREAK —————— */}
      {streak !== null && streak > 1 && (
        <div className="text-center mt-6 text-yellow-300 text-2xl font-bold animate-pulse flex flex-col items-center gap-2">
          {streak}x STREAK! 🔥
          <div className="flex gap-4 text-3xl animate-bounce">
            <span>💥</span>
            <span>🎯</span>
            <span>🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}
