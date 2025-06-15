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

  const updateQuestionIndex = async (index: number) => {
  try {
    await fetch(`http://localhost:5000/games/${gameCode}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionIndex: index }),
    });
  } catch (err) {
    console.error('❌ Failed to update game state:', err);
  }
};


  // Load quiz and current question
 useEffect(() => {
  if (!gameCode || !questionIndex) return;

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`http://localhost:5000/quizzes/${gameCode}`);
      const data = await res.json();
      const qIndex = parseInt(questionIndex);
      setQuiz(data);
      setQuestion(data.questions[qIndex]);
      setTimeLeft(data.questions[qIndex]?.timerInSeconds ?? 30);

      // Also update Firestore with current index when host loads directly
      await updateQuestionIndex(qIndex);
    } catch (err) {
      console.error('❌ Failed to fetch quiz:', err);
    }
  };

  fetchQuiz();
}, [gameCode, questionIndex]);


  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Go to next question
  const handleNext = async () => {
  if (!questionIndex || !quiz || !gameCode) return;

  const nextIndex = parseInt(questionIndex) + 1;
  if (nextIndex < quiz.questions.length) {
    await updateQuestionIndex(nextIndex); // 🧠 sync for players
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
