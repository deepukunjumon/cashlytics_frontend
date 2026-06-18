import { create } from 'zustand';

import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/api/axios';
import type { AuthPayload, User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: AuthPayload) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);

  return raw ? (JSON.parse(raw) as User) : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)),

  setAuth: ({ user, token }) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
