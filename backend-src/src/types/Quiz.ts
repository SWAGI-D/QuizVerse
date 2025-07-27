// backend-src/src/types/Quiz.ts

// New match-pair for "match" question type
type MatchPair = {
  left: string;
  right: string;
};

export interface Question {
  text: string;
  type: 'mcq' | 'truefalse' | 'oneword' | 'selectall' | 'match';  // UPDATED: added selectall & match
  options?: string[];
  // Allow either a single correct answer or an array for multi-select
  answer: string | string[];
  timerInSeconds?: number;
  matchPairs?: MatchPair[];  // NEW: only used when type === 'match'
}

export interface Quiz {
  id?: string;
  title: string;
  code: string;
  createdAt: Date;
  createdBy: string;
  theme?: string; 
  questions: Question[];
}
