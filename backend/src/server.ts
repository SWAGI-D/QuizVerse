import express, { Request, Response } from 'express';
import { db } from './firebase';
import cors from 'cors';
import admin from 'firebase-admin';
import { Player } from '../types/Player';
import { Question, Quiz } from '../types/Quiz';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.post(
  '/users',
  asyncHandler(async (req: { body: { name: any; email: any; role: any; password: any } }, res: Response) => {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, role, password: hashedPassword, createdAt: new Date() };
    const ref = await db.collection('users').add(userData);
    res.status(201).json({ id: ref.id, ...userData });
  })
);

app.put(
  '/users/:id',
  asyncHandler(async (req: { params: { id: string }; body: { role: string } }, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Missing role field' });

    try {
      await db.collection('users').doc(id).update({ role });
      res.status(200).json({ message: 'Role updated', role });
    } catch (error) {
      console.error('❌ Firestore update error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  })
);

app.get(
  '/users/email/:email',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;

    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return res.status(404).json({ error: 'User not found' });

    const doc = snapshot.docs[0];
    res.status(200).json({ id: doc.id, ...doc.data() });
  })
);



app.post(
  '/auth/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();
    const userId = doc.id;

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.status(200).json({
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  })
);

app.post(
  '/players',
  asyncHandler(async (req: { body: { name: string; gameCode: string; avatar: string } }, res: Response) => {
    const { name, gameCode, avatar } = req.body;
    if (!name || !gameCode || !avatar) {
      return res.status(400).json({ error: 'Missing player fields' });
    }

    const existing = await db
      .collection('players')
      .where('gameCode', '==', gameCode)
      .where('name', '==', name)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'Player name already taken in this game' });
    }

    const playerData: Player = { name, gameCode, avatar, joinedAt: new Date() };
    
    const ref = await db.collection('players').add(playerData);
    res.status(201).json({ id: ref.id, ...playerData });

    
  })
);


// app.post(
//   '/quizzes',
//   asyncHandler(async (req: { body: Quiz }, res: Response) => {
//     const { title, code, createdAt, createdBy, questions } = req.body;
//     if (!title || !code || !createdBy || !questions || questions.length === 0) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const quizData: Quiz = {
//       title,
//       code,
//       createdAt: new Date(createdAt),
//       createdBy,
//       questions,
//     };

//     const ref = await db.collection('quizzes').add(quizData);
//     await ref.update({ id: ref.id });
//     res.status(201).json({ id: ref.id, ...quizData });
//   })
// );
app.post(
  '/quizzes',
  asyncHandler(async (req: Request, res: Response) => {
    // Tell TS this is our shared Quiz shape
    const { title, code, createdAt, createdBy, questions, theme } = req.body as Quiz;
    const safeTheme = theme ?? 'default';

    // Basic sanity checks
    if (!title || !code || !createdBy || !questions?.length) {
      return res.status(400).json({ error: 'Missing required quiz fields' });
    }

    // Validate each question by its type
    for (const q of questions) {
      if (!q.text || !q.type) {
        return res.status(400).json({ error: 'Each question needs text and type' });
      }
      switch (q.type) {
        case 'mcq':
        case 'truefalse':
        case 'oneword':
          if (typeof q.answer !== 'string') {
            return res
              .status(400)
              .json({ error: `Question “${q.text}” must have a single string answer` });
          }
          break;

        case 'selectall':
          if (!Array.isArray(q.answer) || q.answer.length < 1) {
            return res
              .status(400)
              .json({ error: `Question “${q.text}” must have an array of correct answers` });
          }
          if (!q.options || q.options.length < 2) {
            return res
              .status(400)
              .json({ error: `Question “${q.text}” needs at least two options` });
          }
          break;

        case 'match':
          if (!q.matchPairs?.length) {
            return res
              .status(400)
              .json({ error: `Question “${q.text}” must include matchPairs` });
          }
          break;

        default:
          return res
            .status(400)
            .json({ error: `Unsupported question type: ${q.type}` });
      }
    }

    // If we get here, it’s valid — save it
    const quizData: Quiz = {
      title,
      code,
      createdAt: new Date(createdAt),
      createdBy,
      questions,
      theme: safeTheme,
    };
    const ref = await db.collection('quizzes').add(quizData);
    await ref.update({ id: ref.id });
    res.status(201).json({ id: ref.id, ...quizData });
  })
);
    

app.get(
  '/players/:gameCode',
  asyncHandler(async (req: { params: { gameCode: string } }, res: Response) => {
    const { gameCode } = req.params;

    const snapshot = await db
      .collection('players')
      .where('gameCode', '==', gameCode)
      .get();

    const players = snapshot.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({
  id: doc.id,
  ...doc.data(),
}));

    res.status(200).json(players);
  })
);

app.delete(
  '/players/:id',
  asyncHandler(async (req: { params: { id: string } }, res: Response) => {
    try {
      await db.collection('players').doc(req.params.id).delete();
      res.status(200).json({ message: 'Player removed' });
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ error: 'Failed to delete player' });
    }
  })
);

app.get(
  '/quizzes/code/:code',
  asyncHandler(async (req: { params: { code: string } }, res: Response) => {
    const snapshot = await db
      .collection('quizzes')
      .where('code', '==', req.params.code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const doc = snapshot.docs[0];
    res.status(200).json({ id: doc.id, ...doc.data() });
  })
);

app.post('/games', async (req, res) => {
  const { code, quizId, questionIndex } = req.body;

  try {
    const gameRef = db.collection('games').doc(code);
    await gameRef.set({
  code,
  quizId,
  questionIndex,
  showScoreboard: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  gameEnded: false, // ✅ added here
});


    res.status(200).send({ message: 'Game session created', code });
  } catch (err) {
    console.error('Error creating game:', err);
    res.status(500).send({ error: 'Failed to create game session' });
  }
});


app.patch(
  '/games/:code',
  asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  const updates = req.body;

  await db.collection('games').doc(code).set(updates, { merge: true });
  res.status(200).json({ message: 'Game updated' });
})

);



app.get(
  '/games/:gameCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { gameCode } = req.params;

    try {
      const gameRef = await db.collection('games').doc(gameCode).get();
      if (!gameRef.exists) return res.status(404).json({ error: 'Game not found' });

      const gameData = gameRef.data();
      res.status(200).json(gameData);

    } catch (err) {
      console.error('Error fetching game:', err);
      res.status(500).json({ error: 'Server error' });
    }
  })
);

// app.post(
//   '/answers',
//   asyncHandler(async (req: { body: { playerId: string; gameCode: string; questionText: string; selectedAnswer: string; isCorrect: boolean; score: number } }, res: Response) => {
//     const { playerId, gameCode, questionText, selectedAnswer, isCorrect, score } = req.body;

//     if (!playerId || !gameCode || !questionText || !selectedAnswer) {
//       return res.status(400).json({ error: 'Missing fields in answer submission' });
//     }

//     const data = {
//       playerId,
//       gameCode,
//       questionText,
//       selectedAnswer,
//       isCorrect,
//       score,
//       answeredAt: new Date(),
//     };

//     const ref = await db.collection('answers').add(data);
//     res.status(201).json({ id: ref.id, ...data });
//   })
// );

// …

app.post(
  '/answers',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      playerId,
      gameCode,
      questionText,
      selectedAnswer,
      isCorrect,
      score: earned,
    } = req.body as {
      playerId: string;
      gameCode: string;
      questionText: string;
      selectedAnswer: string;
      isCorrect: boolean;
      score: number;
    };

    // 1) record the raw answer
    const answerRef = await db.collection('answers').add({
      playerId,
      gameCode,
      questionText,
      selectedAnswer,
      isCorrect,
      score: earned,
      answeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2) upsert into "scores" collection
    const scoreDocId = `${gameCode}_${playerId}`;
    const scoreRef   = db.collection('scores').doc(scoreDocId);

    // fetch name/avatar from players, but default if missing
    const playerSnap = await db.collection('players').doc(playerId).get();
    const playerData = playerSnap.exists
      ? (playerSnap.data() as { name?: string; avatar?: string })
      : {};
    const name   = playerData.name   ?? 'Unknown';
    const avatar = playerData.avatar ?? '🙂';

    // set metadata if new, then increment
    await scoreRef.set(
      { gameCode, playerId, name, avatar },
      { merge: true }
    );
    await scoreRef.update({
      score: admin.firestore.FieldValue.increment(earned),
    });

    // 3) send back JSON only
    res.status(201).json({ id: answerRef.id });
  })
);

// app.get(
//   '/scoreboard/:gameCode',
//   asyncHandler(async (req: Request, res: Response) => {
//     // 1) grab all answers for this game
//     const snapshot = await db
//       .collection('answers')
//       .where('gameCode', '==', req.params.gameCode)
//       .get();

//     // 2) build up a true numeric total per player
//     const totals: Record<string, number> = {};
//     snapshot.forEach((doc) => {
//       const { playerId, score } = doc.data() as { playerId: string; score: number };
//       // initialize once
//       if (!(playerId in totals)) totals[playerId] = 0;
//       // always add the actual score (even if it’s 0 or negative)
//       const pts = Math.max(0, score || 0);
//       totals[playerId] = (totals[playerId] || 0) + pts;

//     });

//     // 3) fetch the players in this game and join with our totals
//     const playersSnapshot = await db
//       .collection('players')
//       .where('gameCode', '==', req.params.gameCode)
//       .get();

//     const scoreboard = playersSnapshot.docs.map((doc) => {
//       const pid = doc.id;
//       const data = doc.data();
//       return {
//         id: pid,
//         name: data.name,
//         avatar: data.avatar,
//         score: totals[pid] ?? 0,
//       };
//     });

//     // 4) sort descending, attach rank, and return
//     const sorted = scoreboard.sort((a, b) => b.score - a.score);
//     const ranked = sorted.map((player, idx) => ({
//     ...player,
//     rank: idx + 1
//     }));
//     res.status(200).json(ranked);

//   })
// );

app.get(
  '/scoreboard/:gameCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { gameCode } = req.params;

    // 1) Query scores for this game, ordered descending
    const snap = await db
      .collection('scores')
      .where('gameCode', '==', gameCode)
      .orderBy('score', 'desc')
      .get();

    // 2) Build the array our client expects
    const board = snap.docs.map(
  (doc: FirebaseFirestore.QueryDocumentSnapshot, idx: number) => {
    const { playerId, name, avatar, score } = doc.data();
    return {
      id: playerId,
      name,
      avatar,
      score,
      rank: idx + 1,
    };
  }
);


    res.status(200).json(board);
  })
);


app.get('/quizzes/host/:hostId', async (req, res) => {
  try {
    const snapshot = await db
      .collection('quizzes')
      .where('createdBy', '==', req.params.hostId)
      .get();

    const quizzes = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
  id: doc.id,
  ...doc.data(),
}));


    res.status(200).json(quizzes);
  } catch (err) {
    console.error('Failed to fetch quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.get(
  '/quizzes/:id',
  asyncHandler(async (req: { params: { id: any } }, res: Response) => {
    const { id } = req.params;
    const doc = await db.collection('quizzes').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Quiz not found' });

    res.status(200).json({ id: doc.id, ...doc.data() });
  })
);

app.delete(
  '/quizzes/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await db.collection('quizzes').doc(id).delete();
      res.status(200).json({ message: 'Quiz deleted' });
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      res.status(500).json({ error: 'Failed to delete quiz' });
    }
  })
);

app.post(
  '/generate-mcqs',
  asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;
    const prompt = `make 5 mcqs just from the following text:\n${text}`;

    try {
      // const response = await fetch('https://9d76-34-16-140-236.ngrok-free.app/generate', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: new URLSearchParams({ prompt }),
      // });
      const response = await fetch('http://localhost:5001/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({ prompt }),
});


      if (!response.ok) {
        throw new Error(`MCQ generation failed: ${response.statusText}`);
      }

      const mcqText = await response.text();
      res.status(200).json({ mcq_raw: mcqText });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ MCQ generation error:', message);
      res.status(500).json({ error: 'MCQ generation failed', details: message });
    }
  })
);


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
