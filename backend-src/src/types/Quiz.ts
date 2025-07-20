// backend-src/src/types/Quiz.ts

export interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options?: string[];
  // Allow either a single correct answer or an array for multi-select
  answer: string | string[];
  timerInSeconds?: number;
}

export interface Quiz {
  id?: string;
  title: string;
  code: string;
  createdAt: Date;
  createdBy: string;
  questions: Question[];
}
