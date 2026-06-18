import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';

function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      toast.error(error);
      navigate('/login', { replace: true });
      return;
    }

    const token                = searchParams.get('token');
    const id                   = searchParams.get('id');
    const name                 = searchParams.get('name');
    const email                = searchParams.get('email');
    const currency             = searchParams.get('currency') ?? 'INR';
    const onboarding_completed = searchParams.get('onboarding_completed') === '1';

    if (!token || !id || !name || !email) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    setAuth({ user: { id, name, email, mobile: null, currency, onboarding_completed }, token });
    toast.success('Logged in successfully.');
    navigate(onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <svg className="size-6 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
