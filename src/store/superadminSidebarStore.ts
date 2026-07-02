import { create } from 'zustand';

const STORAGE_KEY = 'superadmin_sidebar_collapsed';

function readInitial(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

interface SuperadminSidebarState {
  collapsed: boolean;
  expand:    () => void;
  collapse:  () => void;
}

export const useSuperadminSidebarStore = create<SuperadminSidebarState>((set) => ({
  collapsed: readInitial(),

  expand: () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    set({ collapsed: false });
  },

  collapse: () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    set({ collapsed: true });
  },
}));
