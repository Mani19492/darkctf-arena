import { create } from 'zustand';
import { User, Team, CTFEvent, Challenge } from '../types/ctf';
import { mockUser, mockAdmin, mockTeams, mockCTF, mockChallenges } from './mockData';

interface CTFStore {
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // CTF data
  currentCTF: CTFEvent | null;
  challenges: Challenge[];
  teams: Team[];
  
  // UI state
  currentView: 'challenges' | 'leaderboard' | 'admin' | 'profile' | 'login';
  selectedChallenge: Challenge | null;
  
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentView: (view: string) => void;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  submitFlag: (challengeId: string, flag: string) => boolean;
  
  // Admin actions
  toggleChallengeEnabled: (challengeId: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'id'>) => void;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (challengeId: string) => void;
}

export const useCTFStore = create<CTFStore>((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  currentCTF: mockCTF,
  challenges: mockChallenges,
  teams: mockTeams,
  currentView: 'login',
  selectedChallenge: null,
  
  // Actions
  login: (username: string, password: string) => {
    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
      set({ 
        currentUser: mockAdmin, 
        isAuthenticated: true,
        currentView: 'admin'
      });
      return true;
    } else if (username === 'hacker' && password === 'password') {
      set({ 
        currentUser: mockUser, 
        isAuthenticated: true,
        currentView: 'challenges'
      });
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({ 
      currentUser: null, 
      isAuthenticated: false,
      currentView: 'login'
    });
  },
  
  setCurrentView: (view: any) => {
    set({ currentView: view });
  },
  
  setSelectedChallenge: (challenge: Challenge | null) => {
    set({ selectedChallenge: challenge });
  },
  
  submitFlag: (challengeId: string, flag: string) => {
    const { challenges } = get();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge && challenge.flag === flag) {
      // Mark challenge as solved
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId ? { ...c, solves: c.solves + 1 } : c
      );
      set({ challenges: updatedChallenges });
      return true;
    }
    return false;
  },
  
  // Admin actions
  toggleChallengeEnabled: (challengeId: string) => {
    const { challenges } = get();
    const updatedChallenges = challenges.map(c =>
      c.id === challengeId ? { ...c, enabled: !c.enabled } : c
    );
    set({ challenges: updatedChallenges });
  },
  
  addChallenge: (challengeData: Omit<Challenge, 'id'>) => {
    const { challenges } = get();
    const newChallenge: Challenge = {
      ...challengeData,
      id: Math.random().toString(36).substr(2, 9),
      solves: 0
    };
    set({ challenges: [...challenges, newChallenge] });
  },
  
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => {
    const { challenges } = get();
    const updatedChallenges = challenges.map(c =>
      c.id === challengeId ? { ...c, ...updates } : c
    );
    set({ challenges: updatedChallenges });
  },
  
  deleteChallenge: (challengeId: string) => {
    const { challenges } = get();
    const updatedChallenges = challenges.filter(c => c.id !== challengeId);
    set({ challenges: updatedChallenges });
  }
}));