import { create } from 'zustand';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { authAPI } from '../api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setError: (error) => set({ error, loading: false }),

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await authAPI.getCurrentUser();
      set({ user: userData.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  signup: async (email, password, username) => {
    try {
      set({ loading: true, error: null });
      await authAPI.signup({ email, password, username });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await authAPI.getCurrentUser();
      set({ user: userData.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
})); 