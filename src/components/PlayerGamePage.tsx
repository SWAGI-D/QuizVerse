// src/components/PlayerGamePage.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PlayerQuestion from './PlayerQuestion';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
}

export default function PlayerGamePage() {
  const { gameCode, qid } = useParams<{ gameCode: string; qid: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const quiz = localStorage.getItem(`quiz-${gameCode}`);
    if (quiz && qid) {
      const parsed = JSON.parse(quiz);
      const q = parsed.questions[parseInt(qid)];
      setQuestion(q);
      setTimeLeft(q?.timerInSeconds ?? 30);
    }
  }, [gameCode, qid]);

  useEffect(() => {
    if (timeLeft <= 0 || selectedAnswer) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, selectedAnswer]);

  if (!question) return <div className="text-white p-4">Loading question...</div>;

  return (
    <PlayerQuestion
      question={question}
      timeLeft={timeLeft}
      selectedAnswer={selectedAnswer}
      onSelect={setSelectedAnswer}
      score={0}
      streak={0}
      showCorrectAnswer={timeLeft === 0 || !!selectedAnswer}
      correctAnswer={question.answer}
    />
  );
}
