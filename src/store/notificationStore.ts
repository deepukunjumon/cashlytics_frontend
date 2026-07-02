import { create } from 'zustand';

import { clearAll, getRealtimeNotifications, getUnreadCount, markAllRead, markOneRead } from '@/api/realtimeNotifications';
import type { RealtimeNotification } from '@/types';

interface NotificationState {
  items:       RealtimeNotification[];
  unreadCount: number;
  fetch:       () => Promise<void>;
  pushRealtime: (notification: RealtimeNotification) => void;
  markRead:    (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll:    () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,

  fetch: async () => {
    const [page, count] = await Promise.all([getRealtimeNotifications(), getUnreadCount()]);
    set({ items: page.data, unreadCount: count });
  },

  pushRealtime: (notification) => {
    set((state) => {
      if (state.items.some((n) => n.id === notification.id)) return state;

      return {
        items: [notification, ...state.items],
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  markRead: async (id) => {
    await markOneRead(id);
    set((state) => {
      const wasUnread = state.items.some((n) => n.id === id && !n.read_at);
      return {
        items: state.items.map((n) => n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  markAllRead: async () => {
    await markAllRead();
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
      unreadCount: 0,
    }));
  },

  clearAll: async () => {
    await clearAll();
    set({ items: [], unreadCount: 0 });
  },
}));
