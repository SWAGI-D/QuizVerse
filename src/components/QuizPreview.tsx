import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

export default function QuizPreview() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err: any) {
        console.error('❌ Failed to load quiz:', err);
        setError('Failed to load quiz.');
      }
    };
    if (id) load();
  }, [id]);

  const handleHost = async () => {
  const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase(); // e.g., "XJ7QF"

  try {
    await axios.post('http://localhost:5000/games', {
      code: gameCode,
      quizId: id,
      questionIndex: -1,
    });

    navigate(`/host-game/${gameCode}/0`);
  } catch (err) {
    console.error('❌ Failed to host quiz:', err);
    setError('Unable to start hosting session.');
  }
};

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  if (!quiz) {
    return <div className="p-6 text-white">Loading quiz preview...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h2 className="text-3xl font-bold mb-4">
        🧠 Preview: {quiz.title || quiz.code || 'Untitled Quiz'}
      </h2>

      <button
  onClick={handleHost}
  className="mt-6 bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded text-white font-semibold shadow"
>
  🚀 Host This Quiz
</button>

      <div className="space-y-4">
        {quiz.questions?.length > 0 ? (
          quiz.questions.map((q: any, i: number) => (
            <div key={i} className="bg-white/10 p-4 rounded shadow">
              <p>
                <strong>Q{i + 1}:</strong> {q.text}
              </p>
              {q.options && (
                <ul className="list-disc list-inside mt-2 text-sm text-gray-200">
                  {q.options.map((opt: string, j: number) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-sm text-green-400">
                ✅ Correct: {q.answer}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No questions available.</p>
        )}
      </div>
    </div>
  );
}
