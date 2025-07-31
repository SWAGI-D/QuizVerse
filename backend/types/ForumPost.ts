// types/ForumPost.ts

import { Timestamp } from 'firebase-admin/firestore';

export interface ForumPost {
  id?: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'poll';
  createdBy: string;
  createdAt: Timestamp;
}
