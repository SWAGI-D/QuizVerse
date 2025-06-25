// src/components/PlayerGamePage.tsx
import { useEffect, useState } from 'react';
import PlayerQuestion from './PlayerQuestion';
import { useNavigate, useParams } from 'react-router-dom';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
  timerInSeconds?: number;
}

export default function PlayerGamePage() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [quizTitle, setQuizTitle] = useState<string>('Untitled Quiz');
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // 🔄 Poll for current question index
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
    }, 3000);

    return () => clearInterval(interval);
  }, [gameCode]);

  // ❓ Fetch quiz and current question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!gameCode) return;

      try {
        const res = await fetch(`http://localhost:5000/quizzes/code/${gameCode}`);
        if (!res.ok) throw new Error('Quiz not found');

        const quiz = await res.json();
        setQuizTitle(quiz.title || 'Untitled Quiz');

        const q = quiz.questions?.[questionIndex];
        if (!q) {
          setQuestion(null);
          return;
        }

        setQuestion(q);
        setTimeLeft(q.timerInSeconds ?? 30);
        setSelectedAnswer(null);
      } catch (err) {
        console.error('❌ Failed to load quiz question:', err);
      }
    };

    fetchQuestion();
  }, [gameCode, questionIndex]);

  // ⏲️ Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || selectedAnswer) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, selectedAnswer]);

  if (!question) return <div className="text-white p-4">Loading question...</div>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-center text-pink-400 mb-4">
        🎯 {quizTitle}
      </h2>
      <PlayerQuestion
        question={question}
        timeLeft={timeLeft}
        selectedAnswer={selectedAnswer}
        onSelect={async (answer) => {
          if (selectedAnswer) return;
          setSelectedAnswer(answer);

          const player = JSON.parse(localStorage.getItem('playerInfo') || '{}');
          const isCorrect = answer === question.answer;
          const earnedScore = isCorrect ? 100 : 0;

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

            const res = await fetch(`http://localhost:5000/quizzes/code/${gameCode}`);
            const quiz = await res.json();

            if (questionIndex >= quiz.questions.length - 1) {
              navigate(`/player/${gameCode}/scoreboard`);
            }
          } catch (err) {
            console.error('❌ Failed to record answer:', err);
          }
        }}
        score={score}
        streak={streak}
        showCorrectAnswer={timeLeft === 0 || !!selectedAnswer}
        correctAnswer={question.answer}
      />
    </div>
  );
}
