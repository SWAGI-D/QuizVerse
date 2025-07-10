import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options: string[];
  answer: string;
  timerInSeconds: number;
}

interface QuizData {
  title: string;
  code: string;
  createdAt: string;
  questions: Question[];
}

export default function HostDashboard(): React.JSX.Element {
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const [questionText, setQuestionText] = useState<string>('');
  const [questionType, setQuestionType] = useState<'mcq' | 'truefalse' | 'oneword'>('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [gameCode, setGameCode] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleOptionChange = (value: string, index: number): void => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOrUpdateQuestion = (): void => {
    if (!questionText.trim()) {
      setToast({ message: 'Please enter a question.', type: 'error' });
      return;
    }

    const newQuestion: Question = {
      text: questionText,
      type: questionType,
      options: questionType === 'mcq' ? options : [],
      answer: answer.trim(),
      timerInSeconds: timer,
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setTimer(30);
  };

  const handleEditQuestion = (index: number): void => {
    const q = questions[index];
    setQuestionText(q.text);
    setQuestionType(q.type);
    setOptions(q.options.length ? q.options : ['', '', '', '']);
    setAnswer(q.answer);
    setTimer(q.timerInSeconds || 30);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (indexToDelete: number): void => {
    const updatedQuestions = questions.filter((_, i) => i !== indexToDelete);
    setQuestions(updatedQuestions);
    if (editingIndex === indexToDelete) setEditingIndex(null);
  };

  const generateGameCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleSaveQuiz = async (): Promise<void> => {
    const host = JSON.parse(localStorage.getItem('hostInfo') || '{}');
    if (!host?.uid) {
      setToast({ message: 'User not found. Please log in again.', type: 'error' });
      return;
    }

    if (!quizTitle.trim()) {
      setToast({ message: 'Quiz title is required.', type: 'error' });
      return;
    }

    if (questions.length === 0) {
      setToast({ message: 'Add at least one question before saving the quiz.', type: 'error' });
      return;
    }

    const quizCode = generateGameCode();
    const quizData: QuizData = {
      title: quizTitle,
      code: quizCode,
      createdAt: new Date().toISOString(),
      questions,
    };

    try {
      // Step 1: Save the quiz
      const response = await fetch('http://localhost:5000/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizData,
          createdBy: host.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      const savedQuiz = await response.json(); // contains { id, ...quizData }
      const quizId = savedQuiz.id;

      // Step 2: Create the game
      const gameRes = await fetch('http://localhost:5000/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: quizCode,
          quizId,
          questionIndex: -1,
        }),
      });

      if (!gameRes.ok) {
        throw new Error('Failed to create game session');
      }

      setGameCode(quizCode);
      setToast({ message: `✅ Quiz saved! Game code: ${quizCode}`, type: 'success' });
      navigate(`/host-lobby/${quizCode}`);
    } catch (err) {
      console.error('❌ Save or game creation failed:', err);
      setToast({ message: 'Failed to save quiz or create game.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">📋 Host Dashboard – Create Your Quiz</h1>

      <label className="block mb-2 font-semibold">Quiz Title:</label>
      <input
        type="text"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/10 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Enter quiz title (e.g., Science Trivia)"
      />

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-3xl mx-auto mb-8">
        <label className="block mb-2 font-semibold">Question:</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white mb-4"
          placeholder="Enter your question"
        />

        <label className="block mb-2 font-semibold">Question Type:</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as 'mcq' | 'truefalse' | 'oneword')}
          className="w-full p-3 rounded-xl bg-black/60 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="truefalse">True / False</option>
          <option value="oneword">One-word Answer</option>
        </select>

        {questionType === 'mcq' &&
          options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(e.target.value, i)}
              placeholder={`Option ${i + 1}`}
              className="w-full p-3 rounded-xl bg-white/10 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ))}

        {questionType === 'mcq' && (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/60 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select correct answer</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>
                {opt || `Option ${index + 1}`}
              </option>
            ))}
          </select>
        )}

        {questionType === 'truefalse' && (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select correct answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        )}

        {questionType === 'oneword' && (
          <input
            type="text"
            placeholder="Correct one-word answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        )}

        <label className="block mb-2 font-semibold">Timer (in seconds):</label>
        <input
          type="number"
          min="5"
          value={timer}
          onChange={(e) => setTimer(parseInt(e.target.value) || 30)}
          className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="e.g. 30"
        />

        <button
          onClick={handleAddOrUpdateQuestion}
          className={`${
            editingIndex !== null ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold px-6 py-3 rounded-xl mr-4 transition`}
        >
          {editingIndex !== null ? '✅ Update Question' : '➕ Add Question'}
        </button>

        <button
          onClick={handleSaveQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          💾 Save Quiz
        </button>
      </div>

      {gameCode && (
        <div className="mb-6 bg-green-600 text-white rounded-xl p-4 text-center font-semibold shadow-md max-w-xl mx-auto">
          ✅ Share this Game Code with players: <span className="font-bold text-2xl">{gameCode}</span>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur p-6 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">📖 Quiz Preview:</h2>
        {questions.length === 0 ? (
          <p className="text-gray-300">No questions added yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-white/10 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong>{idx + 1}. {q.text}</strong>
                    {q.type === 'mcq' && (
                      <ul className="pl-4 list-disc text-sm mt-1 text-gray-200">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    )}
                    {q.type !== 'mcq' && <p className="text-gray-300 mt-1">Answer: {q.answer}</p>}
                    <p className="text-sm text-gray-400 mt-1">⏱️ Timer: {q.timerInSeconds} seconds</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleEditQuestion(idx)}
                      className="text-yellow-400 hover:text-yellow-500 text-sm font-bold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="text-red-400 hover:text-red-500 text-sm font-bold"
                    >
                      ❌ Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
