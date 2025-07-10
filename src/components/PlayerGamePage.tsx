// src/components/PlayerGamePage.tsx
import React, { useEffect, useRef, useState } from 'react';
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

export default function PlayerGamePage(): React.JSX.Element {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();

  // Game state
  const [questionIndex, setQuestionIndex] = useState<number>(-1);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // Track previous index to detect new questions
  const prevIndexRef = useRef<number>(-1);

  // Quiz + current question
  const [quizTitle, setQuizTitle] = useState<string>('Untitled Quiz');
  const [quizLength, setQuizLength] = useState<number>(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Player progress
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Interim scores
  const [interimScores, setInterimScores] = useState<PlayerScore[]>([]);

  // 1) Poll the game doc every 2s for questionIndex, showScoreboard, gameEnded
  useEffect(() => {
    if (!gameCode) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/games/${gameCode}`);
        const game = (await res.json()) as GameDoc;

        // New question loaded
        if (game.questionIndex !== prevIndexRef.current) {
          prevIndexRef.current = game.questionIndex;
          setQuestionIndex(game.questionIndex);
          setShowScoreboard(false);
        }
        // Host revealed scoreboard
        else if (game.showScoreboard && !showScoreboard) {
          setShowScoreboard(true);
        }
        // Game ended?
        if (game.gameEnded && !gameEnded) {
          setGameEnded(true);
        }
      } catch (e) {
        console.error('❌ Poll error:', e);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [gameCode, showScoreboard, gameEnded]);

  // 2) Navigate to final scoreboard when gameEnded flips
  useEffect(() => {
    if (gameEnded && gameCode) {
      navigate(`/player/${gameCode}/scoreboard`);
    }
  }, [gameEnded, gameCode, navigate]);

  // 3) Fetch quiz & current question when questionIndex changes
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
        setQuizLength(quiz.questions.length);
        const q = quiz.questions[questionIndex];
        setQuestion(q);
        setTimeLeft(q.timerInSeconds ?? 30);
        setSelectedAnswer(null);
      } catch (e) {
        console.error('❌ Load question error:', e);
      }
    })();
  }, [gameCode, questionIndex]);

  

  // 4) Countdown before revealing scoreboard
  useEffect(() => {
    if (showScoreboard || timeLeft <= 0) return;
    const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
  }, [timeLeft, showScoreboard]);

  // 5) Fetch interim scores as soon as showScoreboard is true
  useEffect(() => {
    if (!showScoreboard || !gameCode) return;
    axios
      .get<PlayerScore[]>(`http://localhost:5000/scoreboard/${gameCode}`)
      .then((r) => setInterimScores(r.data))
      .catch((e) => console.error('❌ Interim fetch error:', e));
  }, [showScoreboard, gameCode]);



  // Before game starts
  if (questionIndex === -1) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-300 animate-pulse">
        Waiting for host to start the quiz...
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-center text-pink-400 mb-4">
        🎯 {quizTitle}
      </h2>

      {/* 1) Live question */}
      {!showScoreboard && question && (
        <PlayerQuestion
          question={question}
          timeLeft={timeLeft}
          selectedAnswer={selectedAnswer}
          onSelect={async (answer) => {
            if (selectedAnswer) return;
            setSelectedAnswer(answer);

            const player = JSON.parse(localStorage.getItem('playerInfo') || '{}');
            const isCorrect = answer === question.answer;
            const earned = isCorrect ? 100 + timeLeft * 2 : 0;
            if (isCorrect) {
              setScore((s) => s + earned);
              setStreak((s) => s + 1);
            } else {
              setStreak(0);
            }

            try {
              await fetch('http://localhost:5000/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  playerId: player.id,
                  gameCode,
                  questionText: question.text,
                  selectedAnswer: answer,
                  isCorrect,
                  score: earned,
                }),
              });
            } catch (e) {
              console.error('❌ Record answer error:', e);
            }
          }}
          score={score}
          streak={streak}
          showCorrectAnswer={timeLeft === 0 || !!selectedAnswer}
          correctAnswer={question.answer}
        />
      )}

      {/* 2) Waiting for scoreboard */}
      {!showScoreboard && timeLeft <= 0 && (
        <div className="text-center mt-6 text-gray-300">Waiting for scoreboard…</div>
      )}

      {/* 3) Interim scoreboard */}
      {showScoreboard && (
        + <div className="max-w-md mx-auto bg-purple-700/20 p-4 rounded-xl">
          <h3 className="text-xl font-semibold text-center mb-2">📊 Interim Scores</h3>
         <ul className="divide-y divide-purple-400/30">
            {interimScores.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>
                  {p.avatar} {p.name}
                </span>
                <span className="font-bold">{p.score} pts</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-center text-sm text-gray-300">
            Waiting for next question…
          </div>
        </div>
      )}
    </div>
  );
}
