import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
  timerInSeconds?: number;
}

interface Quiz {
  questions: Question[];
  title?: string;
}

export default function HostQuestion() {
  const { gameCode, questionIndex } = useParams<Record<string, string>>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  const updateQuestionIndex = async (index: number) => {
    try {
      await fetch(`http://localhost:5000/games/${gameCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex: index }),
      });
    } catch (err) {
      console.error('❌ Failed to update game state:', err);
    }
  };

  useEffect(() => {
    if (!gameCode || !questionIndex) return;

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5000/quizzes/code/${gameCode}`);
        if (!res.ok) throw new Error('Quiz not found');

        const data = await res.json();
        if (!data.questions || !Array.isArray(data.questions)) {
          console.error('❌ No questions in quiz');
          return;
        }

        const qIndex = parseInt(questionIndex);
        const currentQuestion = data.questions[qIndex];

        if (!currentQuestion) {
          console.error('❌ Question index out of bounds');
          return;
        }

        setQuiz(data);
        setQuestion(currentQuestion);
        setTimeLeft(currentQuestion.timerInSeconds ?? 30);

        await updateQuestionIndex(qIndex);
      } catch (err) {
        console.error('❌ Failed to fetch quiz:', err);
      }
    };

    fetchQuiz();
  }, [gameCode, questionIndex]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleNext = async () => {
    if (!questionIndex || !quiz || !gameCode || !quiz.questions) return;

    const nextIndex = parseInt(questionIndex) + 1;
    if (nextIndex < quiz.questions.length) {
      await updateQuestionIndex(nextIndex);
      navigate(`/host-game/${gameCode}/${nextIndex}`);
    } else {
      navigate(`/scoreboard/${gameCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center p-6">
      {question ? (
        <>
          <h2 className="text-2xl font-bold text-pink-400 mb-6">{quiz?.title || 'Quiz'}</h2>
          <QuestionCard
            question={question}
            timeLeft={timeLeft}
            selectedAnswer={null}
            onSelect={() => {}}
            score={null}
            streak={null}
          />
          <button
            onClick={handleNext}
            className="mt-10 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-bold transition"
          >
            ⏭️ Next
          </button>
        </>
      ) : (
        <p className="text-white">Loading question...</p>
      )}
    </div>
  );
}
