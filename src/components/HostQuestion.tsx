import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';

// Use the same type expected by QuestionCard
interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  answer: string;
  timerInSeconds?: number; // extra field for host-side timer
}

interface Quiz {
  questions: Question[];
}

export default function HostQuestion() {
  const { gameCode, questionIndex } = useParams<Record<string, string>>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Load quiz and current question
  useEffect(() => {
    if (!gameCode || !questionIndex) return;

    const saved = localStorage.getItem(`quiz-${gameCode}`);
    if (saved) {
      const parsed: Quiz = JSON.parse(saved);
      const qIndex = parseInt(questionIndex);
      setQuiz(parsed);
      const currentQuestion = parsed.questions[qIndex];
      setQuestion(currentQuestion);
      setTimeLeft(currentQuestion?.timerInSeconds ?? 30);
    }
  }, [gameCode, questionIndex]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Go to next question
  const handleNext = () => {
    if (!questionIndex || !quiz || !gameCode) return;

    const nextIndex = parseInt(questionIndex) + 1;
    if (nextIndex < quiz.questions.length) {
      navigate(`/host-game/${gameCode}/${nextIndex}`);
    } else {
      navigate(`/scoreboard/${gameCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center p-6">
      {/* QuestionCard */}
      {question && (
        <QuestionCard
          question={question}
          timeLeft={timeLeft}
          selectedAnswer={null}
          onSelect={() => {}}
          score={null}
          streak={null}
        />
      )}

      <button
        onClick={handleNext}
        className="mt-10 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-bold transition"
      >
        ⏭️ Next
      </button>
    </div>
  );
}
