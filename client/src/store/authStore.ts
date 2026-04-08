import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthUser {
  id: string;
  email: string;
  role: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN' | 'VENDOR';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
          set({ token: data.token, user: data.user, isLoading: false });
          // Set global axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.response?.data?.message || 'Đăng nhập thất bại' });
          return false;
        }
      },

      register: async (email, password, role = 'HOMEOWNER') => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/auth/register`, { email, password, role });
          set({ token: data.token, user: data.user, isLoading: false });
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.response?.data?.message || 'Đăng ký thất bại' });
          return false;
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ token: null, user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'homedesign-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Re-set axios header on app reload
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
