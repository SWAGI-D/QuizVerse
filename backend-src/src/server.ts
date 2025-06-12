import express from 'express';
import { db } from './firebase';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ simple async handler wrapper
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

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



app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
