// store/authStore.ts
import { create } from 'zustand';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
    
    // Return unsubscribe function to prevent memory leaks
    return unsubscribe;
  },
  
  register: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
      // Authentication state change will be detected by the onAuthStateChanged listener
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      // Authentication state change will be detected by the onAuthStateChanged listener
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOut(auth);
      // Authentication state change will be detected by the onAuthStateChanged listener
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));

// Initialize the auth state listener when the app starts
useAuthStore.getState().initialize();