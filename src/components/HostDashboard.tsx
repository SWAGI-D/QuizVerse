import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the Question type
interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options: string[];
  answer: string;
  timerInSeconds: number;
}

// Define the Quiz data structure
interface QuizData {
  code: string;
  createdAt: string;
  questions: Question[];
}

export default function HostDashboard(): React.JSX.Element {
  const navigate = useNavigate();

  // State for all quiz questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form inputs for creating/editing a question
  const [questionText, setQuestionText] = useState<string>('');
  const [questionType, setQuestionType] = useState<'mcq' | 'truefalse' | 'oneword'>('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<string>('');
  const [timer, setTimer] = useState<number>(30); // new: timer in seconds
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null means adding new

  // Game code state after saving quiz
  const [gameCode, setGameCode] = useState<string>('');

  // Update MCQ options
  const handleOptionChange = (value: string, index: number): void => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // Add or update a question with optional timer
  const handleAddOrUpdateQuestion = (): void => {
    if (!questionText.trim()) return alert('Please enter a question');

    const newQuestion: Question = {
      text: questionText,
      type: questionType,
      options: questionType === 'mcq' ? options : [],
      answer: answer.trim(),
      timerInSeconds: timer, // include timer in question
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    // Clear form after add/update
    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setTimer(30);
  };

  // Edit existing question
  const handleEditQuestion = (index: number): void => {
    const q = questions[index];
    setQuestionText(q.text);
    setQuestionType(q.type);
    setOptions(q.options.length ? q.options : ['', '', '', '']);
    setAnswer(q.answer);
    setTimer(q.timerInSeconds || 30); // pre-fill timer
    setEditingIndex(index);
  };

  // Delete a question
  const handleDeleteQuestion = (indexToDelete: number): void => {
    const updatedQuestions = questions.filter((_, i) => i !== indexToDelete);
    setQuestions(updatedQuestions);
    if (editingIndex === indexToDelete) setEditingIndex(null);
  };

  // Generate unique game code
  const generateGameCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  // Save quiz and redirect to host lobby
  const handleSaveQuiz = async (): Promise<void> => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not found. Please sign up again.');
      return;
    }


    if (questions.length === 0) {
      alert("Add at least one question before saving the quiz.");
      return;
    }

    const quizCode = generateGameCode();
    const quizData: QuizData = {
      code: quizCode,
      createdAt: new Date().toISOString(),
      questions,
    };

    const response = await fetch('http://localhost:5000/quizzes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: quizCode,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    questions,
  }),
});

if (!response.ok) {
  alert('Failed to save quiz. Try again.');
  return;
}


    setGameCode(quizCode);
    alert(`✅ Quiz saved! Game code: ${quizCode}`);
    navigate(`/host-lobby/${quizCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">📋 Host Dashboard – Create Your Quiz</h1>

      {/* Question creation form */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-3xl mx-auto mb-8">
        {/* Question input */}
        <label className="block mb-2 font-semibold">Question:</label>
        <input
          type="text"
          value={questionText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionText(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white mb-4"
          placeholder="Enter your question"
        />

        {/* Question type dropdown */}
        <label className="block mb-2 font-semibold">Question Type:</label>
        <select
          value={questionType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuestionType(e.target.value as 'mcq' | 'truefalse' | 'oneword')}
          className="w-full p-3 rounded-xl bg-black/60 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="truefalse">True / False</option>
          <option value="oneword">One-word Answer</option>
        </select>

        {/* Show MCQ options */}
        {questionType === 'mcq' &&
          options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOptionChange(e.target.value, i)}
              placeholder={`Option ${i + 1}`}
              className="w-full p-3 rounded-xl bg-white/10 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ))}

        {/* Correct answer dropdown for MCQ */}
        {questionType === 'mcq' && (
          <select
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAnswer(e.target.value)}
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

        {/* True/False answer */}
        {questionType === 'truefalse' && (
          <select
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select correct answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        )}

        {/* One-word answer input */}
        {questionType === 'oneword' && (
          <input
            type="text"
            placeholder="Correct one-word answer"
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        )}

        {/* Timer input */}
        <label className="block mb-2 font-semibold">Timer (in seconds):</label>
        <input
          type="number"
          min="5"
          value={timer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimer(parseInt(e.target.value) || 30)}
          className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="e.g. 30"
        />

        {/* Add or Update Question button */}
        <button
          onClick={handleAddOrUpdateQuestion}
          className={`${
            editingIndex !== null
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold px-6 py-3 rounded-xl mr-4 transition`}
        >
          {editingIndex !== null ? '✅ Update Question' : '➕ Add Question'}
        </button>

        {/* Save Quiz button */}
        <button
          onClick={handleSaveQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          💾 Save Quiz
        </button>
      </div>

      {/* Game Code after saving */}
      {gameCode && (
        <div className="mb-6 bg-green-600 text-white rounded-xl p-4 text-center font-semibold shadow-md max-w-xl mx-auto">
          ✅ Share this Game Code with players: <span className="font-bold text-2xl">{gameCode}</span>
        </div>
      )}

      {/* Quiz Preview section */}
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
    </div>
  );
}