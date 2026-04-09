import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN' | 'VENDOR';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  setTokenFromOAuth: (token: string) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<boolean>;
  updateProfile: (data: Partial<AuthUser>) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

/** Decode a JWT payload without verifying signature (client-side only) */
function decodeJwtPayload(token: string): any {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setTokenFromOAuth: (token: string) => {
        const payload = decodeJwtPayload(token);
        if (!payload) return;
        const user: AuthUser = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user, error: null });
      },

      login: async (email, pass) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/auth/login`, { email, password: pass });
          const { token, user } = res.data;
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, user, isLoading: false, error: null });
          return true;
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Đăng nhập thất bại.';
          set({ error: typeof msg === 'string' ? msg : msg[0], isLoading: false });
          return false;
        }
      },

      register: async (email, pass, name) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/auth/register`, { email, password: pass, firstName: name });
          const { token, user } = res.data;
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, user, isLoading: false, error: null });
          return true;
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Đăng ký thất bại.';
          set({ error: typeof msg === 'string' ? msg : msg[0], isLoading: false });
          return false;
        }
      },

      updateProfile: async (data: Partial<AuthUser>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.put(`${API_URL}/users/me`, data);
          set((state) => ({ user: { ...state.user, ...res.data }, isLoading: false }));
          return true;
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Lỗi cập nhật hồ sơ.';
          set({ error: typeof msg === 'string' ? msg : msg[0], isLoading: false });
          return false;
        }
      },

      logout: () => {
        // 1. Clear Axios auth header
        delete axios.defaults.headers.common['Authorization'];
        // 2. Wipe all storage
        localStorage.clear();
        sessionStorage.clear();
        // 3. Clear all cookies
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
        });
        // 4. Reset Zustand state
        set({ token: null, user: null, error: null, isLoading: false });
        // 5. Hard redirect — fully re-initialises React tree, no stale state
        window.location.href = '/login';
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'homedesign-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

/** Convenience: Get the raw API URL for building OAuth redirect links */
export const getOAuthUrl = (provider: 'google' | 'facebook') =>
  `${API_URL}/auth/${provider}`;
