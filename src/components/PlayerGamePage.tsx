
import React, { useEffect, useRef, useState, FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerQuestion from './PlayerQuestion';
import axios from 'axios';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
  timerInSeconds?: number;
}

interface PlayerScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface GameDoc {
  quizId: string;
  questionIndex: number;
  showScoreboard: boolean;
  gameEnded: boolean;
}

const PlayerGamePage: FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const playerId = sessionStorage.getItem('playerId') || '';

  // Game state
  const [questionIndex, setQuestionIndex] = useState<number>(-1);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const prevIndexRef = useRef<number>(-1);

  // Quiz + question
  const [quizTitle, setQuizTitle] = useState('Untitled Quiz');
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Player progress
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Interim scores
  const [interimScores, setInterimScores] = useState<PlayerScore[]>([]);

  // 1) Poll game state
  useEffect(() => {
    if (!gameCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/games/${gameCode}`);
        const game = (await res.json()) as GameDoc;
        if (game.questionIndex !== prevIndexRef.current) {
          prevIndexRef.current = game.questionIndex;
          setQuestionIndex(game.questionIndex);
          setShowScoreboard(false);
        } else if (game.showScoreboard && !showScoreboard) {
          setShowScoreboard(true);
        }
        if (game.gameEnded && !gameEnded) {
          setGameEnded(true);
        }
      } catch (err) {
        console.error('❌ Poll error:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [gameCode, showScoreboard, gameEnded]);

  // 2) Navigate to final scoreboard
  useEffect(() => {
    if (gameEnded && gameCode) {
      navigate(`/player/${gameCode}/scoreboard`);
    }
  }, [gameEnded, gameCode, navigate]);

  // 3) Load question
  useEffect(() => {
    if (!gameCode || questionIndex < 0) return;
    (async () => {
      try {
        const gRes = await fetch(`http://localhost:5000/games/${gameCode}`);
        const game = (await gRes.json()) as GameDoc;
        const qRes = await fetch(`http://localhost:5000/quizzes/${game.quizId}`);
        if (!qRes.ok) throw new Error('Quiz not found');
        const quiz = await qRes.json();
        setQuizTitle(quiz.title || 'Untitled Quiz');
        setQuestion(quiz.questions[questionIndex]);
        setTimeLeft(quiz.questions[questionIndex].timerInSeconds ?? 30);
        setSelectedAnswer(null);
      } catch (err) {
        console.error('❌ Load question error:', err);
      }
    })();
  }, [gameCode, questionIndex]);

  // 4) Countdown
  useEffect(() => {
    if (showScoreboard || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showScoreboard]);

  // 5) Fetch interim scores
  useEffect(() => {
    if (!showScoreboard || !gameCode) return;
    const iv = setInterval(() => {
      axios.get<PlayerScore[]>(`http://localhost:5000/scoreboard/${gameCode}`)
        .then((res) => setInterimScores(res.data.sort((a, b) => b.score - a.score)))
        .catch((err) => console.error('❌ Interim fetch error:', err));
    }, 2000);
    return () => clearInterval(iv);
  }, [showScoreboard, gameCode]);

  if (questionIndex === -1) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-300 animate-pulse">
        Waiting for host to start...
      </div>
    );
  }

  return (
    <div className="p-6 text-white flex flex-col items-center">
      <h2 className="text-2xl font-bold text-pink-400 mb-4">🎯 {quizTitle}</h2>

      {/* Live question */}
      {!showScoreboard && question && (
        <PlayerQuestion
          question={question}
          timeLeft={timeLeft}
          selectedAnswer={selectedAnswer}
          onSelect={async (answer) => {
            if (selectedAnswer) return;
            setSelectedAnswer(answer);
            const isCorrect = answer === question.answer;
            const earned = isCorrect ? 100 + timeLeft * 2 : 0;
            if (isCorrect) setScore((s) => s + earned);
            else setStreak(0);
            try {
              await fetch('http://localhost:5000/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  playerId,
                  gameCode,
                  questionText: question.text,
                  selectedAnswer: answer,
                  isCorrect,
                  score: earned,
                }),
              });
            } catch (err) {
              console.error('❌ Record answer error:', err);
            }
          }}
          score={score}
          streak={streak}
          showCorrectAnswer={timeLeft === 0 || !!selectedAnswer}
          correctAnswer={question.answer}
        />
      )}

      {!showScoreboard && timeLeft <= 0 && (
        <div className="mt-6 text-gray-300">Waiting for interim…</div>
      )}

      {/* Interim scoreboard styled like host */}
      {showScoreboard && (
        <div className="flex flex-col items-center space-y-6 w-full">
          <h3 className="text-3xl font-extrabold text-white">📊 Scoreboard</h3>
          <div className="w-full max-w-3xl bg-purple-900/30 p-6 rounded-2xl shadow-lg">
            {interimScores.map((p, idx) => (
              <div
                key={p.id}
                className={`flex justify-between items-center py-4 px-5 mb-3 rounded-xl transition-colors ${
                  idx === 0
                    ? 'bg-purple-700'
                    : idx === 1
                    ? 'bg-purple-800'
                    : idx === 2
                    ? 'bg-purple-600'
                    : 'bg-purple-900/50'
                }`}
              >
                <span className="flex items-center gap-4 text-lg">
                  {idx < 3 && ['🥇','🥈','🥉'][idx]}
                  {p.avatar} {p.name}
                </span>
                <span className="text-2xl font-bold">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerGamePage;
