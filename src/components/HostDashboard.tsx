
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from './Toast';

interface MatchPair {               // NEW
  left: string;
  right: string;
}

interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword' | 'selectall' | 'match';  // UPDATED
  options: string[];
  answer: string | string[];       // UPDATED: string[] for selectall
  timerInSeconds: number;
  matchPairs?: MatchPair[];        // NEW
  theme?: string;
}

interface LocationState {
  selectedTheme?: string;
}

interface QuizData {
  title: string;
  code: string;
  createdAt: string;
  questions: Question[];
}

export default function HostDashboard(): React.JSX.Element {
  const navigate = useNavigate();

  const location = useLocation();
  const locState = (location.state ?? {}) as LocationState;

   const [selectedTheme, setSelectedTheme] = useState<string | undefined>(
    locState.selectedTheme
 );
 useEffect(() => {
   const s = (location.state as LocationState)?.selectedTheme;
  if (s) setSelectedTheme(s);
 }, [location.state]);

  // --- Quiz state ---
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // --- Question builder state ---
  const [questionText, setQuestionText] = useState<string>('');
  const [questionType, setQuestionType] = useState<
    'mcq' | 'truefalse' | 'oneword' | 'selectall' | 'match'   // UPDATED
  >('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<string>('');                  // for single-answer
  const [selectAllAnswers, setSelectAllAnswers] = useState<string[]>([]);  // NEW
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([               // NEW
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
  const [timer, setTimer] = useState<number>(30);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // --- UI / game code state ---
  const [gameCode, setGameCode] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- Handlers for options / special types ---
  const handleOptionChange = (value: string, index: number): void => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSelectAllChange = (opt: string): void => {  // NEW
    setSelectAllAnswers((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleMatchPairChange = (
    idx: number,
    side: 'left' | 'right',
    val: string
  ): void => {  // NEW
    const updated = [...matchPairs];
    updated[idx] = { ...updated[idx], [side]: val };
    setMatchPairs(updated);
  };

  const addMatchPair = (): void => { // NEW
    setMatchPairs((prev) => [...prev, { left: '', right: '' }]);
  };

  // --- Add or update question ---
  const handleAddOrUpdateQuestion = (): void => {
    if (!questionText.trim()) {
      setToast({ message: 'Please enter a question.', type: 'error' });
      return;
    }

    let newQuestion: Question;

    if (questionType === 'selectall') {
      newQuestion = {
        text: questionText,
        type: questionType,
        options,
        answer: selectAllAnswers,                   // array
        timerInSeconds: timer,
      };
    } else if (questionType === 'match') {
      newQuestion = {
        text: questionText,
        type: questionType,
        options: [],
        answer: [],                                  // unused here
        timerInSeconds: timer,
        matchPairs,                                  // host‐defined pairs
      };
    } else {
      newQuestion = {
        text: questionText,
        type: questionType,
        options: questionType === 'mcq' ? options : [],
        answer: answer.trim(),
        timerInSeconds: timer,
      };
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    // Reset builder form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setSelectAllAnswers([]);                          // NEW
    setMatchPairs([
      { left: '', right: '' },
      { left: '', right: '' },
    ]);                                                // NEW
    setTimer(30);
  };

  // --- Edit / delete ---
  const handleEditQuestion = (index: number): void => {
    const q = questions[index];
    setQuestionText(q.text);
    setQuestionType(q.type as any);
    setOptions(q.options.length ? q.options : ['', '', '', '']);
    if (q.type === 'selectall') {
      setSelectAllAnswers(q.answer as string[]);      // NEW
    } else {
      setAnswer(q.answer as string);
    }
    if (q.type === 'match') {
      setMatchPairs(q.matchPairs || [{ left: '', right: '' }]); // NEW
    }
    setTimer(q.timerInSeconds);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (indexToDelete: number): void => {
    setQuestions((qs) => qs.filter((_, i) => i !== indexToDelete));
    if (editingIndex === indexToDelete) setEditingIndex(null);
  };

  // --- Game code generation & saving ---
  const generateGameCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 5 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
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
      setToast({ message: 'Add at least one question before saving.', type: 'error' });
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
      // Save quiz
      const res = await fetch('http://localhost:5000/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme,...quizData, createdBy: host.uid }),
      });
      if (!res.ok) throw new Error('Failed to save quiz');
      const saved = await res.json();
      // Create game session
      const gameRes = await fetch('http://localhost:5000/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: quizCode,
          quizId: saved.id,
          questionIndex: -1,
        }),
      });
      if (!gameRes.ok) throw new Error('Failed to create game');
      setGameCode(quizCode);
      setToast({ message: `✅ Quiz saved! Code: ${quizCode}`, type: 'success' });
      navigate(`/host-lobby/${quizCode}`);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error saving quiz or game.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        📋 Host Dashboard – Create Your Quiz
      </h1>

      {/* Quiz Title */}
      <label className="block mb-2 font-semibold">Quiz Title:</label>
      <input
        type="text"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
        placeholder="Enter quiz title"
        className="w-full p-3 rounded-xl bg-white/10 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Question Builder */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-xl max-w-3xl mx-auto mb-8">
        <label className="block mb-2 font-semibold">Question:</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block mb-2 font-semibold">Question Type:</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as any)}
          className="w-full p-3 mb-4 rounded-xl bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="truefalse">True / False</option>
          <option value="oneword">One-word Answer</option>
          <option value="selectall">Select All That Apply</option>  {/* NEW */}
          <option value="match">Match the Following</option>       {/* NEW */}
        </select>

        {/* MCQ & SelectAll options inputs */}
        {(questionType === 'mcq' || questionType === 'selectall') &&
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

        {/* Single-answer selectors */}
        {questionType === 'mcq' && (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select correct answer</option>
            {options.map((opt, i) => (
              <option key={i} value={opt}>{opt || `Option ${i+1}`}</option>
            ))}
          </select>
        )}

        {questionType === 'truefalse' && (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            className="w-full p-3 mb-4 rounded-xl bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        )}

        {/* Checkbox UI for SelectAll */}
        {questionType === 'selectall' && (
          <div className="mb-4">
            <p className="font-semibold mb-2">Select all correct answers:</p>
            {options.map((opt, i) => (
              <label key={i} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectAllAnswers.includes(opt)}
                  onChange={() => handleSelectAllChange(opt)}
                  className="mr-2"
                />
                {opt || `Option ${i+1}`}
              </label>
            ))}
          </div>
        )}

        {/* Match-pairs UI */}
        {questionType === 'match' && (
          <div className="mb-4">
            <p className="font-semibold mb-2">Enter matching pairs:</p>
            {matchPairs.map((pair, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => handleMatchPairChange(i, 'left', e.target.value)}
                  placeholder={`Left item ${i+1}`}
                  className="flex-1 p-2 rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => handleMatchPairChange(i, 'right', e.target.value)}
                  placeholder={`Right item ${i+1}`}
                  className="flex-1 p-2 rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
            <button
              onClick={addMatchPair}
              className="text-blue-400 hover:underline"
            >
              + Add another pair
            </button>
          </div>
        )}

        {/* Timer */}
        <label className="block mb-2 font-semibold">Timer (seconds):</label>
        <input
          type="number"
          min={5}
          value={timer}
          onChange={(e) => setTimer(parseInt(e.target.value) || 30)}
          className="w-full p-3 mb-4 rounded-xl bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        {/* Buttons */}
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

      {/* Game Code display */}
      {gameCode && (
        <div className="mb-6 bg-green-600 text-white rounded-xl p-4 text-center font-semibold shadow-md max-w-xl mx-auto">
          ✅ Share this Game Code: <span className="font-bold text-2xl">{gameCode}</span>
        </div>
      )}

      {/* Preview */}
      <div className="bg-white/5 backdrop-blur p-6 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">📖 Quiz Preview:</h2>
        {questions.length === 0 ? (
          <p className="text-gray-300">No questions added yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-white/10 p-4 rounded-xl shadow-sm">
                <strong>{idx+1}. {q.text}</strong>

                {/* MCQ */}
                {q.type === 'mcq' && (
                  <ul className="pl-4 list-disc text-sm mt-1 text-gray-200">
                    {q.options.map((o,i)=><li key={i}>{o}</li>)}
                  </ul>
                )}

                {/* SelectAll */}
                {q.type === 'selectall' && Array.isArray(q.answer) && (
                  <ul className="pl-4 list-disc text-sm mt-1 text-gray-200">
                    {q.options.map((o,i)=>(
                      <li key={i}>
                        {o} {(q.answer as string[]).includes(o) ? '✅' : ''}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Match */}
                {q.type === 'match' && q.matchPairs && (
                  <ul className="pl-4 list-disc text-sm mt-1 text-gray-200">
                    {q.matchPairs.map((p,i)=>(
                      <li key={i}>{p.left} — {p.right}</li>
                    ))}
                  </ul>
                )}

                {/* True/False & One-word */}
                {['truefalse','oneword'].includes(q.type) && (
                  <p className="text-gray-300 mt-1">Answer: {q.answer as string}</p>
                )}

                <p className="text-sm text-gray-400 mt-1">⏱️ Timer: {q.timerInSeconds}s</p>

                {/* Edit/Delete */}
                <div className="flex gap-4 mt-2">
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
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

