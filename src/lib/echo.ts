import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { TOKEN_STORAGE_KEY } from '@/api/axios';

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Creates (or reuses) the Echo singleton, authenticated via the Sanctum bearer
 * token rather than cookies — this app is a token-based SPA, not session-based.
 */
export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  // broadcasting/auth is registered outside the routes/api.php group, so it
  // has no /api prefix — strip it off VITE_API_URL to get the app origin.
  const apiOrigin = (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, '');

  echoInstance = new Echo({
    broadcaster: 'reverb',
    Pusher,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiOrigin}/broadcasting/auth`,
    bearerToken: token,
  });

  return echoInstance;
}

/**
 * Tears down the Echo connection — must be called on logout so a stale
 * connection (and its bearer token) doesn't linger for the next user.
 */
export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
