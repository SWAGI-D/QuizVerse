// src/types/Score.ts
export interface Score {
  _id?: string;      // Mongo’s ObjectId as string, if you want it
  gameCode: string;
  playerId: string;
  name:     string;
  avatar:   string;
  score:    number;
  rank?: number;
}
