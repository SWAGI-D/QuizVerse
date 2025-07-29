
// import { useParams, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import QuestionCard from './QuestionCard';
// import axios from 'axios';

// interface Question {
//   text: string;
//   type: 'mcq' | 'truefalse' | 'oneword';
//   options?: string[];
//   answer: string;
//   timerInSeconds?: number;
// }

// interface Quiz {
//   questions: Question[];
//   title?: string;
// }

// interface PlayerScore {
//   id: string;
//   name: string;
//   avatar: string;
//   score: number;
// }

// // shape of your /games/:code document
// interface GameDoc {
//   quizId: string;
//   questionIndex: number;
//   showScoreboard?: boolean;
//   gameEnded?: boolean;
// }

// export default function HostQuestion() {
//   const { gameCode, questionIndex } = useParams<{
//     gameCode: string;
//     questionIndex: string;
//   }>();
//   const navigate = useNavigate();

//   const [quiz, setQuiz] = useState<Quiz | null>(null);
//   const [question, setQuestion] = useState<Question | null>(null);
//   const [timeLeft, setTimeLeft] = useState<number>(0);
//   const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
//   const [scoreboardData, setScoreboardData] = useState<PlayerScore[]>([]);

//   // helper to PATCH game doc
//   const updateGameState = async (updates: Partial<GameDoc>) => {
//     try {
//       await axios.patch(`http://localhost:5000/games/${gameCode}`, updates);
//     } catch (err) {
//       console.error('❌ Failed to update game state:', err);
//     }
//   };

//   // load quiz + question whenever questionIndex changes
//   useEffect(() => {
//     if (!gameCode || questionIndex == null) return;

//     const load = async () => {
//       try {
//         // 1️⃣ fetch game doc
//         const gameRes = await fetch(`http://localhost:5000/games/${gameCode}`);
//         if (!gameRes.ok) throw new Error('Game not found');
//         const gameData = (await gameRes.json()) as GameDoc;

//         // 2️⃣ fetch quiz by ID
//         const quizRes = await fetch(`http://localhost:5000/quizzes/${gameData.quizId}`);
//         if (!quizRes.ok) throw new Error('Quiz not found');
//         const quizData = (await quizRes.json()) as Quiz;

//         const idx = parseInt(questionIndex, 10);
//         const q = quizData.questions[idx];
//         if (!q) throw new Error('Question index out of bounds');

//         // initialize
//         setQuiz(quizData);
//         setQuestion(q);
//         setTimeLeft(q.timerInSeconds ?? 30);
//         setShowScoreboard(false);
//         setScoreboardData([]);

//         // reset scoreboard flag in Firestore
//         await updateGameState({ questionIndex: idx, showScoreboard: false });
//       } catch (err) {
//         console.error('❌ Failed to load game or quiz:', err);
//       }
//     };

//     load();
//   }, [gameCode, questionIndex]);

//   // countdown
//   useEffect(() => {
//     if (timeLeft <= 0) return;
//     const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
//     return () => clearInterval(iv);
//   }, [timeLeft]);

//   // once time is up, host can reveal the interim scoreboard
//   const revealScoreboard = async () => {
//     try {
//       // get scores
//       const res = await axios.get<PlayerScore[]>(`http://localhost:5000/scoreboard/${gameCode}`);
//       setScoreboardData(res.data);
//       setShowScoreboard(true);

//       // mark in Firestore
//       await updateGameState({ showScoreboard: true });
//     } catch (err) {
//       console.error('❌ Failed to load scoreboard:', err);
//     }
//   };

//   // host moves to next question (or ends the game)
//   const handleNext = async () => {
//     if (!quiz) return;
//     const idx = parseInt(questionIndex || '0', 10);
//     const next = idx + 1;

//     if (next < quiz.questions.length) {
//       await updateGameState({ questionIndex: next, showScoreboard: false });
//       navigate(`/host-game/${gameCode}/${next}`);
//     } else {
//       await updateGameState({ gameEnded: true });
//       navigate(`/scoreboard/${gameCode}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center p-6">
//       {!question ? (
//         <p className="text-white">Loading question...</p>
//       ) : (
//         <>
//           <h2 className="text-2xl font-bold text-pink-400 mb-6">
//             {quiz?.title || 'Quiz'}
//           </h2>

//           {/* Show the question until scoreboard is revealed */}
//           {!showScoreboard ? (
//             <>
//               <QuestionCard
//                 question={question}
//                 timeLeft={timeLeft}
//                 selectedAnswer={null}
//                 onSelect={() => {}}
//                 score={null}
//                 streak={null}
//               />
//               {timeLeft <= 0 && (
//                 <button
//                   onClick={revealScoreboard}
//                   className="mt-6 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-semibold"
//                 >
//                   📊 Reveal Scoreboard
//                 </button>
//               )}
//             </>
//           ) : (
//             <>
//               {/* Interim scoreboard */}
//               <h3 className="text-xl font-semibold mt-6 mb-3">📈 Scoreboard</h3>
//               <ul className="bg-white/10 p-4 rounded-xl w-full max-w-md space-y-2">
//                 {scoreboardData.map((p) => (
//                   <li key={p.id} className="flex justify-between">
//                     <span>{p.avatar} {p.name}</span>
//                     <span className="font-bold">{p.score} pts</span>
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 onClick={handleNext}
//                 className="mt-6 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-bold transition"
//               >
//                 ⏭️ Next
//               </button>
//             </>
//           )}

//           {/* Always allow the host to end the game immediately */}
//           <button
//             onClick={async () => {
//               await updateGameState({ gameEnded: true });
//               navigate(`/scoreboard/${gameCode}`);
//             }}
//             className="bg-red-500 hover:bg-red-600 px-6 py-2 text-white rounded-full mt-6"
//           >
//             🛑 End Game
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QuestionCard from "components/shared/QuestionCard";

import axios from 'axios';

interface MatchPair {
  left: string;
  right: string;
}

interface Question {
  text: string;
  type:
    | 'mcq'
    | 'truefalse'
    | 'oneword'
    | 'selectall'
    | 'match';
  options?: string[];
  answer: string | string[];
  timerInSeconds?: number;
  matchPairs?: MatchPair[];
}

interface Quiz {
  questions: Question[];
  title?: string;
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
  showScoreboard?: boolean;
  gameEnded?: boolean;
}

export default function HostQuestion() {
  const { gameCode, questionIndex } = useParams<{
    gameCode: string;
    questionIndex: string;
  }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [scoreboardData, setScoreboardData] = useState<PlayerScore[]>([]);

  const updateGameState = async (updates: Partial<GameDoc>) => {
    if (!gameCode) return;
    try {
      await axios.patch(`http://localhost:5000/games/${gameCode}`, updates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!gameCode || questionIndex == null) return;
    (async () => {
      try {
        const gameRes = await fetch(`http://localhost:5000/games/${gameCode}`);
        if (!gameRes.ok) throw new Error('Game not found');
        const gameData = (await gameRes.json()) as GameDoc;

        const quizRes = await fetch(`http://localhost:5000/quizzes/${gameData.quizId}`);
        if (!quizRes.ok) throw new Error('Quiz not found');
        const quizData = (await quizRes.json()) as Quiz;

        const idx = parseInt(questionIndex, 10);
        const q = quizData.questions[idx];
        if (!q) throw new Error('Question index out of bounds');

        setQuiz(quizData);
        setQuestion(q);
        setTimeLeft(q.timerInSeconds ?? 30);
        setShowScoreboard(false);
        setScoreboardData([]);

        await updateGameState({ questionIndex: idx, showScoreboard: false });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [gameCode, questionIndex]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  const revealScoreboard = async () => {
    if (!gameCode) return;
    try {
      const res = await axios.get<PlayerScore[]>(`http://localhost:5000/scoreboard/${gameCode}`);
      setScoreboardData(res.data);
      setShowScoreboard(true);
      await updateGameState({ showScoreboard: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = async () => {
    if (!quiz || !gameCode) return;
    const idx = parseInt(questionIndex || '0', 10);
    const next = idx + 1;

    if (next < quiz.questions.length) {
      await updateGameState({ questionIndex: next, showScoreboard: false });
      navigate(`/host-game/${gameCode}/${next}`);
    } else {
      await updateGameState({ gameEnded: true });
      navigate(`/scoreboard/${gameCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center p-6">
      {!question ? (
        <p>Loading question...</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-pink-400 mb-6">
            {quiz?.title || 'Quiz'}
          </h2>

          {!showScoreboard ? (
            <>
              {/* Pass all required props into QuestionCard */}
              <QuestionCard
                question={question}
                timeLeft={timeLeft}
                selectedAnswer={null}
                onSelect={(v) => {}}
                score={null}
                streak={null}
              />

              {timeLeft <= 0 && (
                <button
                  onClick={revealScoreboard}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl"
                >
                  📊 Reveal Scoreboard
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mt-6 mb-3">📈 Scoreboard</h3>
              <ul className="bg-white/10 p-4 rounded-xl w-full max-w-md space-y-2">
                {scoreboardData.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.avatar} {p.name}</span>
                    <span className="font-bold">{p.score} pts</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleNext}
                className="mt-6 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl"
              >
                ⏭️ Next
              </button>
            </>
          )}

          <button
            onClick={async () => {
              await updateGameState({ gameEnded: true });
              navigate(`/scoreboard/${gameCode}`);
            }}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full mt-6"
          >
            🛑 End Game
          </button>
        </>
      )}
    </div>
  );
}
