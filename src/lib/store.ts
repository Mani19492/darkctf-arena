import { create } from 'zustand';
import { User, Team, CTFEvent, Challenge } from '../types/ctf';
import { mockUser, mockAdmin, mockTeams, mockCTF, mockChallenges } from './mockData';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface CTFStore {
  // Auth state
  currentUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // CTF data
  currentCTF: CTFEvent | null;
  challenges: Challenge[];
  teams: Team[];
  
  // UI state
  currentView: 'challenges' | 'leaderboard' | 'admin' | 'profile' | 'login';
  selectedChallenge: Challenge | null;
  
  // Actions
  setUser: (user: SupabaseUser | null) => void;
  setSession: (session: Session | null) => void;
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
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  currentCTF: mockCTF,
  challenges: mockChallenges,
  teams: mockTeams,
  currentView: 'login',
  selectedChallenge: null,
  
  // Actions
  setUser: (user: SupabaseUser | null) => {
    set({ 
      currentUser: user,
      isAuthenticated: !!user
    });
    
    // Check if user is admin
    if (user) {
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          set({ isAdmin: data?.is_admin || false });
        });
    } else {
      set({ isAdmin: false });
    }
  },

  setSession: (session: Session | null) => {
    set({ session });
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ 
      currentUser: null,
      session: null,
      isAuthenticated: false,
      isAdmin: false,
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