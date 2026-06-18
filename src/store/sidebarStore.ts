import { create } from 'zustand';

const STORAGE_KEY = 'sidebar_open';

function readInitial(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open:   () => void;
  close:  () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: readInitial(),

  toggle: () => set((state) => {
    const next = !state.isOpen;
    localStorage.setItem(STORAGE_KEY, String(next));
    return { isOpen: next };
  }),

  open: () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    set({ isOpen: true });
  },

  close: () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    set({ isOpen: false });
  },
}));
