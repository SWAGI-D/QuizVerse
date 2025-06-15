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
  const { gameCode } = useParams<{ gameCode: string }>();
const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
const [streak, setStreak] = useState(0);

  useEffect(() => {
  if (!gameCode) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:5000/games/${gameCode}`);
      const data = await res.json();
      if (data?.questionIndex !== undefined) {
        setQuestionIndex(data.questionIndex);
      }
    } catch (err) {
      console.error('❌ Failed to fetch current question index:', err);
    }
  }, 3000); // check every 3 seconds

  return () => clearInterval(interval);
}, [gameCode]);

useEffect(() => {
  const fetchQuestion = async () => {
    if (!gameCode) return;

    try {
      const res = await fetch(`http://localhost:5000/quizzes/${gameCode}`);
      if (!res.ok) throw new Error('Quiz not found');

      const quiz = await res.json();
      const q = quiz.questions[questionIndex];

      if (!q) {
        setQuestion(null);
        return;
      }

      setQuestion(q);
      setTimeLeft(q?.timerInSeconds ?? 30);
      setSelectedAnswer(null); // reset answer for new question
    } catch (err) {
      console.error('❌ Failed to load quiz question:', err);
    }
  };

  fetchQuestion();
}, [gameCode, questionIndex]);



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
      onSelect={async (answer) => {
  if (selectedAnswer) return; // prevent double submission
  setSelectedAnswer(answer);

  const player = JSON.parse(localStorage.getItem('playerInfo') || '{}');
  const isCorrect = answer === question.answer;
  const earnedScore = isCorrect ? 100 : 0;

  // Update score and streak in local state
  if (isCorrect) {
    setScore((prev) => prev + 100);
    setStreak((prev) => prev + 1);
  } else {
    setStreak(0);
  }

  try {
    await fetch('http://localhost:5000/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: player?.id,
        gameCode,
        questionText: question.text,
        selectedAnswer: answer,
        isCorrect,
        score: earnedScore,
      }),
    });
  } catch (err) {
    console.error('❌ Failed to record answer:', err);
  }
}}


      score={score}
      streak={streak}
      showCorrectAnswer={timeLeft === 0 || !!selectedAnswer}
      correctAnswer={question.answer}
    />
  );
}
