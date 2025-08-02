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
  currentView: 'challenges' | 'leaderboard' | 'admin' | 'profile' | 'admin-users' | 'login' | 'htb-leaderboard' | 'admin-htb' | 'admin-reset';
  selectedChallenge: Challenge | null;
  
  // Actions
  setUser: (user: SupabaseUser | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
  setCurrentView: (view: string) => void;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  submitFlag: (challengeId: string, flag: string) => Promise<boolean>;
  loadChallenges: () => Promise<void>;
  loadCurrentCTF: () => Promise<void>;
  
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
  currentCTF: null,
  challenges: [],
  teams: [],
  currentView: 'login',
  selectedChallenge: null,
  
  // Actions
  setUser: (user: SupabaseUser | null) => {
    set({ 
      currentUser: user,
      isAuthenticated: !!user
    });
    
    // Check if user is admin and load data if authenticated
    if (user) {
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          set({ isAdmin: data?.is_admin || false });
        });
      
      // Load challenges and CTF data when user logs in
      setTimeout(() => {
        get().loadChallenges();
      }, 0);
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
  
  submitFlag: async (challengeId: string, flag: string) => {
    const { challenges, currentUser } = get();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || !currentUser) return false;
    
    try {
      // Check if user already solved this challenge
      const { data: existingSolve } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('challenge_id', challengeId)
        .eq('is_correct', true)
        .single();

      if (existingSolve) {
        return false; // Already solved
      }

      // Check if flag is correct (trim whitespace and ensure case-sensitive comparison)
      if (challenge.flag.trim() === flag.trim()) {
        // Get user's team
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', currentUser.id)
          .single();

        if (!teamMember) return false;

        // Create submission record
        await supabase
          .from('submissions')
          .insert({
            user_id: currentUser.id,
            team_id: teamMember.team_id,
            challenge_id: challengeId,
            flag: flag,
            is_correct: true
          });

        // Get current team points and update
        const { data: team } = await supabase
          .from('teams')
          .select('points')
          .eq('id', teamMember.team_id)
          .single();

        const newPoints = (team?.points || 0) + challenge.points;

        // Update team points
        await supabase
          .from('teams')
          .update({ 
            points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamMember.team_id);

        // Update local challenge solves count
        const updatedChallenges = challenges.map(c => 
          c.id === challengeId ? { ...c, solves: c.solves + 1 } : c
        );
        set({ challenges: updatedChallenges });
        
        return true;
      }
      
      // Record incorrect submission
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', currentUser.id)
        .single();

      if (teamMember) {
        await supabase
          .from('submissions')
          .insert({
            user_id: currentUser.id,
            team_id: teamMember.team_id,
            challenge_id: challengeId,
            flag: flag,
            is_correct: false
          });
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting flag:', error);
      return false;
    }
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
  },

  // Load data functions
  loadChallenges: async () => {
    try {
      const { data: ctfEvents } = await supabase
        .from('ctf_events')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (ctfEvents && ctfEvents.length > 0) {
        const currentEvent = ctfEvents[0];
        set({ currentCTF: {
          id: currentEvent.id,
          name: currentEvent.name,
          description: currentEvent.description || '',
          startTime: new Date(currentEvent.start_time),
          endTime: new Date(currentEvent.end_time),
          isPublic: currentEvent.is_public,
          enabled: currentEvent.enabled,
          challenges: []
        }});

        const { data: challenges } = await supabase
          .from('challenges')
          .select('*')
          .eq('ctf_event_id', currentEvent.id)
          .eq('enabled', true);

        if (challenges) {
          const formattedChallenges = challenges.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category as 'Web' | 'Pwn' | 'Crypto' | 'Forensics' | 'Reverse' | 'Misc',
            points: c.points,
            flag: c.flag,
            hints: Array.isArray(c.hints) ? c.hints as any[] : [],
            files: c.files || [],
            solves: 0,
            enabled: c.enabled,
            ctfId: c.ctf_event_id
          }));
          set({ challenges: formattedChallenges });
        }
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  },

  loadCurrentCTF: async () => {
    try {
      const { data: ctfEvents } = await supabase
        .from('ctf_events')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (ctfEvents && ctfEvents.length > 0) {
        const currentEvent = ctfEvents[0];
        set({ currentCTF: {
          id: currentEvent.id,
          name: currentEvent.name,
          description: currentEvent.description || '',
          startTime: new Date(currentEvent.start_time),
          endTime: new Date(currentEvent.end_time),
          isPublic: currentEvent.is_public,
          enabled: currentEvent.enabled,
          challenges: []
        }});
      }
    } catch (error) {
      console.error('Error loading CTF:', error);
    }
  }
}));