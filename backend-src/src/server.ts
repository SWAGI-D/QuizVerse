<<<<<<< HEAD

import { db } from './firebase';
import cors from 'cors';
import { Player } from './types/Player';
import { Quiz } from './types/Quiz';
import express, { Request, Response } from 'express';
import admin from 'firebase-admin';

=======
import express from 'express';
import { db } from './firebase';
import cors from 'cors';
>>>>>>> a7281e8c2b16fbc42c0b293fd1fdf797c75138be

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ simple async handler wrapper
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

<<<<<<< HEAD


=======
>>>>>>> a7281e8c2b16fbc42c0b293fd1fdf797c75138be
app.post(
  '/users',
  asyncHandler(async (req: { body: { name: any; email: any; role: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; name?: any; email?: any; role?: any; createdAt?: Date; id?: string; }): void; new(): any; }; }; }) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const userData = {
      name,
      email,
      role,
      createdAt: new Date(),
    };

    const ref = await db.collection('users').add(userData);
    res.status(201).json({ id: ref.id, ...userData });
  })
);

app.put(
  '/users/:id',
  asyncHandler(
    async (
      req: { params: { id: string }; body: { role: string } },
      res: { status: (code: number) => { json: (body: any) => void } }
    ) => {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: 'Missing role field' });
      }

      try {
        const userRef = db.collection('users').doc(id);
        await userRef.update({ role });
        res.status(200).json({ message: 'Role updated', role });
      } catch (error) {
        console.error('❌ Firestore update error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
      }
    }
  )
);

<<<<<<< HEAD
app.post(
  '/players',
  asyncHandler(
    async (
      req: { body: { name: string; gameCode: string; avatar: string } },
      res: { status: (code: number) => { json: (data: any) => void } }
    ) => {
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


      const playerData: Player = {
        name,
        gameCode,
        avatar,
        joinedAt: new Date(),
      };

      const ref = await db.collection('players').add(playerData);
      return res.status(201).json({ id: ref.id, ...playerData });
    }
  )
);

app.post(
  '/quizzes',
  asyncHandler(
    async (
      req: { body: Quiz },
      res: { status: (code: number) => { json: (data: any) => void } }
    ) => {
      const { code, createdAt, createdBy, questions } = req.body;

      if (!code || !createdBy || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const quizData: Quiz = {
        code,
        createdAt: new Date(createdAt),
        createdBy,
        questions,
      };

      const ref = await db.collection('quizzes').add(quizData);
      res.status(201).json({ id: ref.id, ...quizData });
    }
  )
);

app.get(
  '/players/:gameCode',
  asyncHandler(async (req: { params: { gameCode: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: FirebaseFirestore.DocumentData[]): void; new(): any; }; }; }) => {
    const { gameCode } = req.params;

    const snapshot = await db
      .collection('players')
      .where('gameCode', '==', gameCode)
      .get();

    const players = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

    res.status(200).json(players);
  })
);

app.delete(
  '/players/:id',
  asyncHandler(async (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; error?: string; }): void; new(): any; }; }; }) => {
    const { id } = req.params;

    try {
      await db.collection('players').doc(id).delete();
      res.status(200).json({ message: 'Player removed' });
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ error: 'Failed to delete player' });
    }
  })
);

app.get(
  '/quizzes/:code',
  asyncHandler(async (req: { params: { code: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; id?: string; }): void; new(): any; }; }; }) => {
    const { code } = req.params;

    const snapshot = await db
      .collection('quizzes')
      .where('code', '==', code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const doc = snapshot.docs[0];
    res.status(200).json({ id: doc.id, ...doc.data() });
  })
);

app.patch(
  '/games/:code',
  asyncHandler(async (req: { params: { code: any; }; body: { questionIndex: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
    const { code } = req.params;
    const { questionIndex } = req.body;

    await db.collection('games').doc(code).set(
      { questionIndex },
      { merge: true }
    );

    res.status(200).json({ message: 'Question index updated' });
  })
);

app.get(
  '/games/:gameCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { gameCode } = req.params;

    try {
      const gameRef = await db.collection('games').doc(gameCode).get();

      if (!gameRef.exists) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const gameData = gameRef.data();
      res.status(200).json({ questionIndex: gameData?.questionIndex });
    } catch (err) {
      console.error('Error fetching game:', err);
      res.status(500).json({ error: 'Server error' });
    }
  })
);



app.post(
  '/answers',
  asyncHandler(async (req: { body: { playerId: any; gameCode: any; questionText: any; selectedAnswer: any; isCorrect: any; score: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; playerId?: any; gameCode?: any; questionText?: any; selectedAnswer?: any; isCorrect?: any; score?: any; answeredAt?: Date; id?: string; }): void; new(): any; }; }; }) => {
    const { playerId, gameCode, questionText, selectedAnswer, isCorrect, score } = req.body;

    if (!playerId || !gameCode || !questionText || !selectedAnswer) {
      return res.status(400).json({ error: 'Missing fields in answer submission' });
    }

    const data = {
      playerId,
      gameCode,
      questionText,
      selectedAnswer,
      isCorrect,
      score,
      answeredAt: new Date(),
    };

    const ref = await db.collection('answers').add(data);
    res.status(201).json({ id: ref.id, ...data });
  })
);


app.get(
  '/scoreboard/:gameCode',
  asyncHandler(async (req: Request, res: Response) => {
    const snapshot = await db
      .collection('answers')
      .where('gameCode', '==', req.params.gameCode)
      .get();

    const totals: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const { playerId, score } = doc.data();
      if (!totals[playerId]) totals[playerId] = 0;
      totals[playerId] += score || 0;
    });

    const playersSnapshot = await db
      .collection('players')
      .where('gameCode', '==', req.params.gameCode)
      .get();

    const scoreboard = playersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      avatar: doc.data().avatar,
      score: totals[doc.id] || 0,
    }));

    res.status(200).json(scoreboard.sort((a, b) => b.score - a.score));
  })
);

=======
>>>>>>> a7281e8c2b16fbc42c0b293fd1fdf797c75138be


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
