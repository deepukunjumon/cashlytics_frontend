import { type ReactNode } from 'react';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <Navbar />

      <div
        className={cn(
          'flex flex-col flex-1 pt-16 transition-all duration-300',
          // Mobile: no left padding (sidebar is an overlay). Desktop: offset by sidebar.
          isOpen ? 'md:pl-60' : 'md:pl-16'
        )}
      >
        <main className="flex-1 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
