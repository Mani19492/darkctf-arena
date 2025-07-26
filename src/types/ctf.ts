export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  teamId?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  points: number;
  lastSubmission?: Date;
  solvedChallenges: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'Web' | 'Pwn' | 'Crypto' | 'Forensics' | 'Reverse' | 'Misc';
  points: number;
  flag: string;
  hints: Hint[];
  files: string[];
  solves: number;
  enabled: boolean;
  ctfId: string;
}

export interface Hint {
  id: string;
  text: string;
  pointDeduction: number;
}

export interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isPublic: boolean;
  enabled: boolean;
  challenges: Challenge[];
}

export interface Submission {
  id: string;
  userId: string;
  teamId: string;
  challengeId: string;
  flag: string;
  isCorrect: boolean;
  timestamp: Date;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  points: number;
  lastSubmission: Date;
  solvedChallenges: number;
}