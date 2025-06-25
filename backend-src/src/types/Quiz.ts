export interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword';
  options: string[];
  answer: string;
  timerInSeconds: number;
}

export interface Quiz {
  title: string;
  code: string;
  createdAt: Date;
  createdBy: string; // Firestore user ID
  questions: Question[];
}
