import { CTFEvent, Challenge, Team, User, LeaderboardEntry } from '../types/ctf';

export const mockUser: User = {
  id: '1',
  username: 'h4ck3r',
  email: 'hacker@ctf.com',
  isAdmin: false,
  teamId: '1',
  createdAt: new Date()
};

export const mockAdmin: User = {
  id: 'admin1',
  username: 'admin',
  email: 'admin@ctf.com',
  isAdmin: true,
  createdAt: new Date()
};

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Cyber Ninjas',
    members: [mockUser],
    points: 1250,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 30),
    solvedChallenges: ['1', '2', '4']
  },
  {
    id: '2',
    name: 'Binary Bandits',
    members: [],
    points: 980,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 45),
    solvedChallenges: ['1', '3']
  },
  {
    id: '3',
    name: 'Script Kiddies',
    members: [],
    points: 750,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 60),
    solvedChallenges: ['2']
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'SQL Injection Basic',
    description: 'Find the hidden flag in this vulnerable login form. The admin password is hidden in the database.',
    category: 'Web',
    points: 100,
    flag: 'CTF{sql_1nj3ct10n_b4s1c}',
    hints: [
      { id: '1', text: 'Try using \' OR 1=1 --', pointDeduction: 10 },
      { id: '2', text: 'Look for the admin table', pointDeduction: 20 }
    ],
    files: [],
    solves: 25,
    enabled: true,
    ctfId: '1'
  },
  {
    id: '2',
    title: 'Caesar Cipher',
    description: 'Decode this encrypted message: GUR SYNТ VF PGS{P3F4E_PVCURE_QRPELCGRQ}',
    category: 'Crypto',
    points: 150,
    flag: 'CTF{c3s4r_cipher_decrypted}',
    hints: [
      { id: '3', text: 'ROT13 is a common Caesar cipher', pointDeduction: 15 }
    ],
    files: [],
    solves: 18,
    enabled: true,
    ctfId: '1'
  },
  {
    id: '3',
    title: 'Buffer Overflow',
    description: 'Exploit this vulnerable C program to gain shell access.',
    category: 'Pwn',
    points: 300,
    flag: 'CTF{buff3r_0v3rfl0w_pwn3d}',
    hints: [
      { id: '4', text: 'Look for the return address on the stack', pointDeduction: 30 }
    ],
    files: ['vuln.c', 'vuln'],
    solves: 8,
    enabled: true,
    ctfId: '1'
  },
  {
    id: '4',
    title: 'Hidden in Plain Sight',
    description: 'Find the flag hidden in this image file.',
    category: 'Forensics',
    points: 200,
    flag: 'CTF{st3g4n0gr4phy_m4st3r}',
    hints: [
      { id: '5', text: 'Try using steghide or strings', pointDeduction: 20 }
    ],
    files: ['image.jpg'],
    solves: 12,
    enabled: true,
    ctfId: '1'
  }
];

export const mockCTF: CTFEvent = {
  id: '1',
  name: 'CyberSec Championship 2024',
  description: 'Welcome to the ultimate cybersecurity challenge. Test your skills across multiple domains.',
  startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
  endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
  isPublic: true,
  enabled: true,
  challenges: mockChallenges
};

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    teamName: 'Cyber Ninjas',
    points: 1250,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 30),
    solvedChallenges: 3
  },
  {
    rank: 2,
    teamName: 'Binary Bandits',
    points: 980,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 45),
    solvedChallenges: 2
  },
  {
    rank: 3,
    teamName: 'Script Kiddies',
    points: 750,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 60),
    solvedChallenges: 1
  },
  {
    rank: 4,
    teamName: 'Null Pointers',
    points: 400,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 90),
    solvedChallenges: 2
  },
  {
    rank: 5,
    teamName: 'Root Access',
    points: 200,
    lastSubmission: new Date(Date.now() - 1000 * 60 * 120),
    solvedChallenges: 1
  }
];