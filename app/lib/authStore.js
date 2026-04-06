import { create } from 'zustand';
import { auth, provider } from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  authError: null,   // এখন error দেখানোর জন্য

  // Google Login
  loginWithGoogle: async () => {
    set({ authError: null });
    try {
      const result = await signInWithPopup(auth, provider);
      set({ user: result.user, authError: null });
    } catch (err) {
      console.error('Google Login Error:', err);
      set({ authError: err.message });
    }
  },

  // Email দিয়ে Login
  loginWithEmail: async (email, password) => {
    set({ authError: null, loading: true });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user, 
        authError: null 
      });
    } catch (err) {
      console.error('Email Login Error:', err);
      set({ authError: err.message });
      throw err; // LoginPage এ error দেখানোর জন্য throw করা হচ্ছে
    } finally {
      set({ loading: false });
    }
  },

  // Email দিয়ে Sign Up
  signUpWithEmail: async (email, password) => {
    set({ authError: null, loading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user, 
        authError: null 
      });
    } catch (err) {
      console.error('Sign Up Error:', err);
      set({ authError: err.message });
      throw err; // LoginPage এ error দেখানোর জন্য
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, authError: null });
    } catch (err) {
      console.error('Logout Error:', err);
    }
  },

  // Auth State Listener
  listenAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        loading: false 
      });
    });
  },

  // Error ক্লিয়ার করার জন্য
  clearError: () => set({ authError: null }),
}));