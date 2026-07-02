import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import * as authApi from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { disconnectEcho, getEcho } from '@/lib/echo';
import type { LoginPayload, RegisterPayload, RealtimeNotification, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const fetchNotifications = useNotificationStore((state) => state.fetch);
  const pushRealtime = useNotificationStore((state) => state.pushRealtime);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectEcho();
      return;
    }

    void fetchNotifications();

    const echo = getEcho();
    const channel = echo.private(`App.Models.User.${user.id}`);

    channel.notification((notification: RealtimeNotification) => {
      pushRealtime(notification);
    });

    return () => {
      echo.leave(`App.Models.User.${user.id}`);
    };
  }, [isAuthenticated, user, fetchNotifications, pushRealtime]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      async login(payload) {
        const auth = await authApi.login(payload);
        setAuth(auth);
        toast.success('Logged in successfully.');
        navigate(auth.user.onboarding_completed ? '/dashboard' : '/onboarding');
      },
      async register(payload) {
        const auth = await authApi.register(payload);
        setAuth(auth);
        toast.success('Account created successfully.');
        navigate('/onboarding');
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          clearAuth();
          navigate('/login');
        }
      },
    }),
    [user, isAuthenticated, setAuth, clearAuth, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
