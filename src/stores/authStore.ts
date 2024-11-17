import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  isOfflineMode: boolean;
  setUser: (user: User | null) => void;
  setOfflineMode: (enabled: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isOfflineMode: false,
      setUser: (user) => set({ user }),
      setOfflineMode: (enabled) => set({ isOfflineMode: enabled, user: null }),
      signIn: async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'https://shopping-card-list.netlify.app/auth/callback',
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error signing in:', error);
          throw error;
        }
      },
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, isOfflineMode: false });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isOfflineMode: state.isOfflineMode })
    }
  )
);