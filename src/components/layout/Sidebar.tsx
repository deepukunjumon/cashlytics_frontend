import {
  BarChart3,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PieChart,
  RefreshCw,
  Settings,
  Shield,
  Tag,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';
import { logout } from '@/api/auth';
import { toast } from 'sonner';
import logoIcon from '@/assets/logo-icon.png';
import logoWhiteText from '@/assets/logo-white-text.png';
import logoDarkText from '@/assets/logo-dark-text.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const mainNav = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/accounts',     label: 'Accounts',     icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
];

const planningNav = [
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/budgets',    label: 'Budgets',    icon: PieChart },
  { to: '/recurring',  label: 'Recurring',  icon: RefreshCw },
];

const insightsNav = [
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const accountNav = [
  { to: '/profile',  label: 'Profile',  icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface NavSectionProps {
  label:    string;
  items:    { to: string; label: string; icon: React.ElementType }[];
  isOpen:   boolean;
  onNavigate?: () => void;
}

function NavSection({ label, items, isOpen, onNavigate }: NavSectionProps) {
  return (
    <div>
      <p
        className={cn(
          'text-[10px] uppercase tracking-widest text-[var(--sidebar-foreground)]/40 px-3 mb-1 mt-4 font-semibold overflow-hidden whitespace-nowrap transition-all duration-300',
          isOpen ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 mt-0 mb-0'
        )}
      >
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]',
                isActive && 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold'
              )
            }
            title={!isOpen ? itemLabel : undefined}
          >
            <Icon size={18} className="shrink-0" />
            <span
              className={cn(
                'truncate overflow-hidden transition-all duration-300',
                isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
              )}
            >
              {itemLabel}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();
  const { user, clearAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fullLogo = theme === 'dark' ? logoWhiteText : logoDarkText;

  const closeMobile = () => {
    if (window.innerWidth < 768) close();
  };

  const doLogout = async () => {
    try { await logout(); } catch { /* token may already be invalid */ }
    clearAuth();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-300',
          // Mobile: hidden when closed, slide in as overlay when open
          isOpen ? 'w-60' : '-translate-x-full md:translate-x-0 md:w-16'
        )}
      >
        {/* Logo / Header */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)] shrink-0">
          <div
            className={cn(
              'relative h-9 shrink-0 overflow-hidden transition-all duration-100',
              isOpen ? 'w-[130px]' : 'w-9'
            )}
          >
            {/* Icon only — shown when collapsed */}
            <img
              src={logoIcon}
              alt="Cashlytics"
              className={cn(
                'absolute inset-y-0 left-0 h-9 w-9 object-contain transition-opacity duration-300',
                isOpen ? 'opacity-0' : 'opacity-100'
              )}
            />
            {/* Full logo (icon + text), theme-swapped — shown when expanded */}
            <img
              src={fullLogo}
              alt="Cashlytics"
              className={cn(
                'absolute inset-y-0 left-0 w-auto h-9 object-contain object-left transition-opacity duration-300',
                isOpen ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>
          {/* Collapse/expand toggle — single stable element, decoupled from header flex layout */}
          <button
            onClick={toggle}
            className={cn(
              'p-1.5 rounded-md text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors shrink-0',
              !isOpen && 'hidden'
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
          {/* Expand button when collapsed */}
          {!isOpen && (
            <button
              onClick={toggle}
              className="hidden md:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-background border border-border shadow-sm items-center justify-center text-foreground hover:bg-accent transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronLeft size={12} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <NavSection label="Menu"      items={mainNav}     isOpen={isOpen} onNavigate={closeMobile} />
          <NavSection label="Planning"  items={planningNav} isOpen={isOpen} onNavigate={closeMobile} />
          <NavSection label="Insights"  items={insightsNav} isOpen={isOpen} onNavigate={closeMobile} />
          <NavSection label="Account"   items={accountNav} isOpen={isOpen} onNavigate={closeMobile} />

          {user?.role === 'superadmin' && (
            <div>
              <p
                className={cn(
                  'text-[10px] uppercase tracking-widest text-blue-500 px-3 mb-1 mt-4 font-semibold overflow-hidden whitespace-nowrap transition-all duration-300',
                  isOpen ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 mt-0 mb-0'
                )}
              >
                Admin
              </p>
              <NavLink
                to="/superadmin"
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                    'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10',
                    isActive && 'bg-blue-500/10 font-semibold'
                  )
                }
                title={!isOpen ? 'Superadmin' : undefined}
              >
                <Shield size={18} className="shrink-0" />
                <span
                  className={cn(
                    'truncate overflow-hidden transition-all duration-300',
                    isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
                  )}
                >
                  Superadmin Panel
                </span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="shrink-0 px-2 pb-3 border-t border-[var(--sidebar-border)] pt-3 space-y-1">
          {user && (
            <div
              className={cn(
                'rounded-md bg-[var(--sidebar-accent)]/50 overflow-hidden transition-all duration-300',
                isOpen ? 'opacity-100 max-h-16 px-2.5 py-2 mb-2' : 'opacity-0 max-h-0 px-2.5 py-0 mb-0'
              )}
            >
              <p className="text-xs font-medium text-[var(--sidebar-foreground)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--sidebar-foreground)]/60 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
              'text-[var(--sidebar-foreground)] hover:bg-destructive/10 hover:text-destructive cursor-pointer'
            )}
            title={!isOpen ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            <span
              className={cn(
                'truncate overflow-hidden transition-all duration-300',
                isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be returned to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
