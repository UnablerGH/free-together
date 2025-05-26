import { create } from 'zustand';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { authAPI } from '../api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, loading: false, error: null }),
  setError: (error) => set({ error, loading: false }),

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for the token to be available
      const token = await userCredential.user.getIdToken();
      
      // Now make the request with the token
      const userData = await authAPI.getCurrentUser();
      set({ user: userData.data, loading: false, error: null });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  signup: async (email, password, username) => {
    try {
      set({ loading: true, error: null });
      await authAPI.signup({ email, password, username });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for the token to be available
      const token = await userCredential.user.getIdToken();
      
      // Now make the request with the token
      const userData = await authAPI.getCurrentUser();
      set({ user: userData.data, loading: false, error: null });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
})); 