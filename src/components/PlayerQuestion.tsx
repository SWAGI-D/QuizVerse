// src/components/PlayerQuestion.tsx
import React, { useState, useEffect } from 'react';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
}

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
}: PlayerQuestionProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Timer */}
        <div className="mb-6 text-center text-lg font-semibold tracking-wide text-cyan-300">
          TIME REMAINING: <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
        </div>

        {/* Question */}
        <h2 className="text-4xl font-bold mb-10 text-center">{question.text}</h2>

        {/* MULTIPLE CHOICE */}
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
                    isCorr
                      ? 'bg-green-600 ring-2 ring-white'
                      : isSel
                      ? 'bg-gray-800 ring-2 ring-white'
                      : colors[idx % colors.length]
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* TRUE / FALSE */}
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
                    isCorr
                      ? 'bg-green-600 ring-2 ring-white'
                      : isSel
                      ? 'bg-gray-800 ring-2 ring-white'
                      : grad
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* ONE-WORD */}
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
                ✅ Correct Answer: <span className="font-bold">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        {/* LIVE SCORE BAR */}
        <div className="mb-8">
          <p className="font-bold text-pink-300 mb-2">LIVE SCORE</p>
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>

        {/* STREAK */}
        {streak > 1 && (
          <div className="text-center text-yellow-300 text-2xl font-bold animate-pulse">
            🔥 {streak}× STREAK!
          </div>
        )}
      </div>
    </div>
  );
}
