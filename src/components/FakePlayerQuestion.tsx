// FakePlayerQuestion.tsx
import { useState, useEffect } from 'react';
import PlayerQuestion from './PlayerQuestion';
import React from 'react';

// Define the Question type
interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
}

export default function FakePlayerQuestion(): React.JSX.Element {
  // 🧪 Mock data
  const dummyQuestion: Question = {
    text: "What is the capital of France?",
    type: "mcq", // Try "truefalse" or "oneword" too
    options: ["Berlin", "Paris", "London", "Madrid"],
    answer: "Paris",
  };

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(90);
  const [streak, setStreak] = useState<number>(2);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !selectedAnswer) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, selectedAnswer]);

  // Handle answer selection
  const handleSelect = (ans: string): void => {
    setSelectedAnswer(ans);
    if (ans === dummyQuestion.answer) {
      setScore(score + 10);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <PlayerQuestion
      question={dummyQuestion}
      timeLeft={timeLeft}
      selectedAnswer={selectedAnswer}
      onSelect={handleSelect}
      score={score}
      streak={streak}
      correctAnswer={dummyQuestion.answer}
      showCorrectAnswer={!!selectedAnswer || timeLeft === 0}
    />
  );
}