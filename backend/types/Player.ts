export interface Player {
  name: string;
  gameCode: string;
  avatar: string;
  joinedAt: Date;
  status?: 'active' | 'joinedLate' | 'leftEarly';
  leftAt?: Date;
}