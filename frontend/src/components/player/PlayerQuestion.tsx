// // src/components/PlayerQuestion.tsx
// import React, { useState, useEffect } from 'react';

// interface Question {
//   text: string;
//   type: 'mcq' | 'truefalse' | 'oneword';
//   options?: string[];
//   answer: string;
// }

// interface PlayerQuestionProps {
//   question: Question;
//   timeLeft: number;
//   selectedAnswer: string | null;
//   onSelect: (answer: string) => void;
//   score: number;
//   streak: number;
//   showCorrectAnswer: boolean;
//   correctAnswer: string;
// }

// export default function PlayerQuestion({
//   question,
//   timeLeft,
//   selectedAnswer,
//   onSelect,
//   score,
//   streak,
//   showCorrectAnswer,
//   correctAnswer,
// }: PlayerQuestionProps) {
//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center px-6 py-12">
//       <div className="w-full max-w-4xl">
//         {/* Timer */}
//         <div className="mb-6 text-center text-lg font-semibold tracking-wide text-cyan-300">
//           TIME REMAINING: <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
//         </div>

//         {/* Question */}
//         <h2 className="text-4xl font-bold mb-10 text-center">{question.text}</h2>

//         {/* MULTIPLE CHOICE */}
//         {question.type === 'mcq' && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
//             {question.options?.map((opt, idx) => {
//               const isSel = selectedAnswer === opt;
//               const isCorr = showCorrectAnswer && correctAnswer === opt;
//               const colors = ['bg-green-400/80','bg-pink-400/80','bg-blue-400/80','bg-yellow-400/80'];
//               return (
//                 <button
//                   key={idx}
//                   onClick={() => onSelect(opt)}
//                   disabled={!!selectedAnswer || showCorrectAnswer}
//                   className={`w-full py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg ${
//                     isCorr
//                       ? 'bg-green-600 ring-2 ring-white'
//                       : isSel
//                       ? 'bg-gray-800 ring-2 ring-white'
//                       : colors[idx % colors.length]
//                   }`}
//                 >
//                   {opt}
//                 </button>
//               );
//             })}
//           </div>
//         )}

//         {/* TRUE / FALSE */}
//         {question.type === 'truefalse' && (
//           <div className="grid grid-cols-2 gap-6 mb-8">
//             {['True','False'].map((opt) => {
//               const isSel = selectedAnswer === opt;
//               const isCorr = showCorrectAnswer && correctAnswer === opt;
//               const grad = opt === 'True' ? 'bg-green-400/80' : 'bg-red-400/80';
//               return (
//                 <button
//                   key={opt}
//                   onClick={() => onSelect(opt)}
//                   disabled={!!selectedAnswer || showCorrectAnswer}
//                   className={`w-full py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg ${
//                     isCorr
//                       ? 'bg-green-600 ring-2 ring-white'
//                       : isSel
//                       ? 'bg-gray-800 ring-2 ring-white'
//                       : grad
//                   }`}
//                 >
//                   {opt}
//                 </button>
//               );
//             })}
//           </div>
//         )}

//         {/* ONE-WORD */}
//         {question.type === 'oneword' && (
//           <div className="mb-8">
//             <input
//               type="text"
//               placeholder="Type your answer and press Enter"
//               disabled={!!selectedAnswer || showCorrectAnswer}
//               className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   const v = (e.target as HTMLInputElement).value.trim();
//                   if (v) onSelect(v);
//                 }
//               }}
//             />
//             {showCorrectAnswer && (
//               <p className="mt-3 text-green-300 text-center">
//                 ✅ Correct Answer: <span className="font-bold">{correctAnswer}</span>
//               </p>
//             )}
//           </div>
//         )}

//         {/* LIVE SCORE BAR */}
//         <div className="mb-8">
//           <p className="font-bold text-pink-300 mb-2">LIVE SCORE</p>
//           <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
//             <div
//               className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
//               style={{ width: `${Math.min(score, 100)}%` }}
//             />
//           </div>
//         </div>

//         {/* STREAK */}
//         {streak > 1 && (
//           <div className="text-center text-yellow-300 text-2xl font-bold animate-pulse">
//             🔥 {streak}× STREAK!
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';

interface MatchPair {
  left: string;
  right: string;
}

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword' | 'selectall' | 'match';
  options?: string[];
  answer: string | string[];
  timerInSeconds?: number;
  matchPairs?: MatchPair[];
}

interface PlayerQuestionProps {
  question: Question;
  timeLeft: number;
  selectedAnswer: string | string[] | null;
  onSelect: (answer: string | string[]) => void;
  score: number;
  streak: number;
  showCorrectAnswer: boolean;
  correctAnswer: string | string[];
}

export default function PlayerQuestion({
  question,
  timeLeft,
  selectedAnswer,
  onSelect,
  score,
  streak,
  showCorrectAnswer,
  correctAnswer,
}: PlayerQuestionProps) {
  // State for multi-select
  const [localMulti, setLocalMulti] = useState<string[]>(
    Array.isArray(selectedAnswer) ? selectedAnswer : []
  );
  // State for match
  const [localMatch, setLocalMatch] = useState<Record<string, string>>({});
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);

  // Shuffle helper
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Initialize match state when question changes
  useEffect(() => {
    if (question.type === 'match' && question.matchPairs) {
      const rights = question.matchPairs.map((p) => p.right);
      setShuffledRights(shuffleArray(rights));
      const mapping: Record<string, string> = {};
      question.matchPairs.forEach((p) => (mapping[p.left] = ''));
      setLocalMatch(mapping);
    }
  }, [question]);

  // Handlers
  const handleMultiChange = (opt: string) => {
    if (showCorrectAnswer) return;
    setLocalMulti((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };
  const submitMulti = () => onSelect(localMulti);

  const handleMatchChange = (left: string, right: string) => {
    if (showCorrectAnswer) return;
    setLocalMatch((prev) => ({ ...prev, [left]: right }));
  };
  const submitMatch = () => {
    const ans = question.matchPairs!.map((p) => localMatch[p.left]);
    onSelect(ans);
  };

  return (
    
      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/30 animate-fade-in">

        {/* Timer */}
        <div className="mb-6 text-center text-lg font-semibold tracking-wide text-cyan-300">
          TIME REMAINING: <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
        </div>

        {/* Question Text */}
        <h2 className="text-4xl font-bold mb-10 text-center">{question.text}</h2>

        {/* MCQ */}
        {question.type === 'mcq' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {question.options?.map((opt, idx) => {
              const isSel = selectedAnswer === opt;
              const isCorr = showCorrectAnswer && correctAnswer === opt;
              const colors = ['bg-green-400/80','bg-pink-400/80','bg-blue-400/80','bg-yellow-400/80'];
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(opt)}
                  disabled={!!selectedAnswer || showCorrectAnswer}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg ${
                    isCorr ? 'bg-green-600 ring-2 ring-white'
                          : isSel ? 'bg-gray-800 ring-2 ring-white'
                          : colors[idx % colors.length]
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {question.type === 'truefalse' && (
          <div className="grid grid-cols-2 gap-6 mb-8">
            {['True','False'].map((opt) => {
              const isSel = selectedAnswer === opt;
              const isCorr = showCorrectAnswer && correctAnswer === opt;
              const grad = opt === 'True' ? 'bg-green-400/80' : 'bg-red-400/80';
              return (
                <button
                  key={opt}
                  onClick={() => onSelect(opt)}
                  disabled={!!selectedAnswer || showCorrectAnswer}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg ${
                    isCorr ? 'bg-green-600 ring-2 ring-white'
                          : isSel ? 'bg-gray-800 ring-2 ring-white'
                          : grad
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* One-word answer */}
        {question.type === 'oneword' && (
          <div className="mb-8">
            <input
              type="text"
              placeholder="Type your answer and press Enter"
              disabled={!!selectedAnswer || showCorrectAnswer}
              className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) onSelect(v);
                }
              }}
            />
            {showCorrectAnswer && (
              <p className="mt-3 text-green-300 text-center">
                ✅ Correct Answer: <span className="font-bold">{correctAnswer as string}</span>
              </p>
            )}
          </div>
        )}

        {/* Select All That Apply */}
        {question.type === 'selectall' && question.options && (
          <div className="mb-8">
            <p className="font-semibold mb-2">Select all that apply:</p>
            {question.options.map((opt, i) => (
              <label key={i} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={localMulti.includes(opt)}
                  disabled={showCorrectAnswer}
                  onChange={() => handleMultiChange(opt)}
                  className="mr-2 w-5 h-5 accent-cyan-400"
                />
                <span className="text-lg">{opt}</span>
              </label>
            ))}
            {!showCorrectAnswer && (
              <button
                onClick={submitMulti}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl"
              >
                Submit Answers
              </button>
            )}
          </div>
        )}

        {/* Match the Following */}
        {question.type === 'match' && question.matchPairs && (
          <div className="mb-8">
            <p className="font-semibold mb-2">Match the following:</p>
            {question.matchPairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-4 mb-2">
                <span className="px-4 py-2 bg-white/10 rounded-lg">
                  {pair.left}
                </span>
                <select
                  value={localMatch[pair.left]}
                  disabled={showCorrectAnswer}
                  onChange={(e) => handleMatchChange(pair.left, e.target.value)}
                  className="w-1/2 p-4 rounded-xl bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="" disabled>
                    Select match
                  </option>
                  {shuffledRights.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {!showCorrectAnswer && (
              <button
                onClick={submitMatch}
                className="mt-4 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl"
              >
                Submit Matches
              </button>
            )}
          </div>
        )}

        {/* Live Score Bar and Streak */}
        <div className="mb-8">
          <p className="font-bold text-pink-300 mb-2">LIVE SCORE</p>
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>
        {streak > 1 && (
          <div className="text-center text-yellow-300 text-2xl font-bold animate-pulse">
            🔥 {streak}× STREAK!
          </div>
        )}
      </div>
    
  );
}

