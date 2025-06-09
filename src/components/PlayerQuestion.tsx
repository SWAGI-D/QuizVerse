import React from 'react';

// Define the Question type (same as in FakePlayerQuestion)
interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
}

// Define the component props interface
interface PlayerQuestionProps {
  question: Question;
  timeLeft: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  score: number;
  streak: number;
  showCorrectAnswer: boolean;
  correctAnswer: string;
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
}: PlayerQuestionProps): React.JSX.Element {
  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-poppins flex flex-col items-center justify-start">
      {/* Timer */}
      <div className="text-center mb-6 text-lg font-semibold tracking-wider text-cyan-300">
        TIME REMAINING: <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
      </div>

      {/* Question */}
      <h2 className="text-3xl font-bold mb-10 text-center max-w-3xl">
        {question?.text || "Waiting for question..."}
      </h2>

      {/* MULTIPLE CHOICE */}
      {question?.type === 'mcq' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
          {question.options?.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = showCorrectAnswer && correctAnswer === opt;
            const colorMap = [
              "from-green-400 to-green-600",
              "from-pink-400 to-pink-600",
              "from-blue-400 to-blue-600",
              "from-yellow-400 to-yellow-500"
            ];
            return (
              <button
                key={idx}
                onClick={() => onSelect(opt)}
                disabled={!!selectedAnswer || showCorrectAnswer}
                className={`py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg
                  ${isCorrect ? "bg-green-600 ring-2 ring-white" :
                  isSelected ? "bg-gray-800 ring-2 ring-white" :
                  `bg-gradient-to-br ${colorMap[idx % 4]}`}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* TRUE / FALSE */}
      {question?.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mb-8">
          {['True', 'False'].map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = showCorrectAnswer && correctAnswer === opt;
            const gradient = opt === 'True'
              ? "from-green-400 to-green-600"
              : "from-red-400 to-red-600";

            return (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                disabled={!!selectedAnswer || showCorrectAnswer}
                className={`py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg
                  ${isCorrect ? "bg-green-600 ring-2 ring-white" :
                  isSelected ? "bg-gray-800 ring-2 ring-white" :
                  `bg-gradient-to-br ${gradient}`}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* ONE-WORD */}
      {question?.type === 'oneword' && (
        <div className="mb-8 w-full max-w-md">
          <input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelect(e.target.value)}
            disabled={!!selectedAnswer || showCorrectAnswer}
            placeholder="Type your answer"
            className="w-full p-4 rounded-xl bg-white/10 text-white placeholder:text-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {showCorrectAnswer && (
            <p className="text-green-300 mt-3 font-semibold text-center">
              ✅ Correct Answer: <span className="font-bold">{correctAnswer}</span>
            </p>
          )}
        </div>
      )}

      {/* LIVE SCORE BAR */}
      {score !== null && (
        <div className="mb-8 w-full max-w-3xl text-left">
          <p className="text-pink-300 font-bold mb-2">LIVE SCORE</p>
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-2xl mt-2 px-2 animate-bounce">
            <span>🎉</span>
            <span>👏</span>
            <span>🙌</span>
          </div>
        </div>
      )}

      {/* STREAK DISPLAY */}
      {streak > 1 && (
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