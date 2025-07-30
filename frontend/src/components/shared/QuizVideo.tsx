// import React, { useEffect, useRef, useState } from 'react';

// // QuizVideo.tsx – synchronous triggers using timeupdate event
// // Place video.mp4 and quiz_questions.json in public/

// type QuizQuestion = {
//   time: number;
//   question: string;
//   options: string[];
//   answer: string;
// };

// const QuizVideo: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
//   const [answered, setAnswered] = useState(false);
//   const nextQuestionPtr = useRef<number>(0);

//   // Load and sort questions by time
//   useEffect(() => {
//     fetch('/quiz_questions.json')
//       .then(res => {
//         if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
//         return res.json();
//       })
//       .then((data: QuizQuestion[]) => {
//         const clean = data.map(q => ({ ...q, question: q.question.trim() }));
//         clean.sort((a, b) => a.time - b.time);
//         setQuestions(clean);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   // Attach timeupdate listener for synchronous quiz trigger
//   useEffect(() => {
//     const vid = videoRef.current;
//     if (!vid) return;

//     const onTimeUpdate = () => {
//       const ptr = nextQuestionPtr.current;
//       if (ptr >= questions.length) return;
//       const q = questions[ptr];
//       // fire exactly when crossing timestamp
//       if (vid.currentTime >= q.time && currentQuestionIndex === null) {
//         vid.pause();
//         setCurrentQuestionIndex(ptr);
//         nextQuestionPtr.current += 1;
//       }
//     };

//     vid.addEventListener('timeupdate', onTimeUpdate);
//     return () => {
//       vid.removeEventListener('timeupdate', onTimeUpdate);
//     };
//   }, [questions, currentQuestionIndex]);

//   // Handle answer and resume playback
//   const handleAnswer = (opt: string) => {
//     if (currentQuestionIndex === null) return;
//     const q = questions[currentQuestionIndex];
//     alert(opt === q.answer ? '✅ Correct!' : `❌ Wrong! Answer: ${q.answer}`);
//     setAnswered(true);
//     setTimeout(() => {
//       setAnswered(false);
//       setCurrentQuestionIndex(null);
//       videoRef.current?.play();
//     }, 800);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center py-10 px-4">
//       <h1 className="text-3xl font-bold mb-6">🎬 Video Quiz</h1>
//       <div className="w-full max-w-4xl bg-black/60 backdrop-blur rounded-2xl overflow-hidden mb-8">
//         <video
//           ref={videoRef}
//           src="/video.mp4"
//           controls
//           className="w-full"
//           muted={false}
//           onError={() => console.error('Video failed to load: check /public/video.mp4')}
//         />
//       </div>

//       {/* Quiz Popup Overlay */}
//       {currentQuestionIndex !== null && !answered && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
//           <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl max-w-xl w-full">
//             <p className="text-lg font-semibold mb-4 break-words whitespace-normal">
//               {questions[currentQuestionIndex].question}
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {questions[currentQuestionIndex].options.map(opt => (
//                 <button
//                   key={opt}
//                   onClick={() => handleAnswer(opt)}
//                   className="bg-gray-700 hover:bg-gray-600 transition rounded-lg px-4 py-3 text-left whitespace-normal break-words"
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuizVideo;

// QuizVideo.tsx – synchronizes questions to transcript segments
// Place video.mp4, quiz_questions.json, and transcripts.json in public/

import React, { useEffect, useRef, useState } from 'react';

// QuizVideo.tsx – simple 12‑second interval quiz
// Place video.mp4 and quiz_questions.json in public/

type QuizQuestion = { question: string; options: string[]; answer: string };

const QuizVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const nextQPtr = useRef(0);

  // Load all questions once
  useEffect(() => {
    fetch('/quiz_questions.json')
      .then(res => {
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        // strip to only question/options/answer
        const qs = data.map(q => ({
          question: q.question.trim(),
          options: q.options,
          answer: q.answer
        }));
        setQuestions(qs);
      })
      .catch(err => console.error(err));
  }, []);

  // Attach timeupdate to fire every 12s
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTimeUpdate = () => {
      if (currentIdx !== null) return;  // waiting for answer
      const t = Math.floor(vid.currentTime);
      const ptr = nextQPtr.current;
      if (ptr < questions.length && t >= (ptr + 1) * 12) {
        vid.pause();
        setCurrentIdx(ptr);
        nextQPtr.current += 1;
      }
    };
    vid.addEventListener('timeupdate', onTimeUpdate);
    return () => vid.removeEventListener('timeupdate', onTimeUpdate);
  }, [questions, currentIdx]);

  const handleAnswer = (opt: string) => {
    if (currentIdx === null) return;
    const q = questions[currentIdx];
    alert(opt === q.answer ? '✅ Correct!' : `❌ Wrong! Answer: ${q.answer}`);
    setAnswered(true);
    setTimeout(() => {
      setAnswered(false);
      setCurrentIdx(null);
      videoRef.current?.play();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Video Quiz</h1>
      <div className="w-full max-w-3xl mb-8">
        <video
          ref={videoRef}
          src="/video.mp4"
          controls
          className="w-full rounded-lg bg-black"
        />
      </div>

      {currentIdx !== null && !answered && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full">
            <p className="text-lg font-semibold mb-4">
              {questions[currentIdx].question}
            </p>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentIdx].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizVideo;
