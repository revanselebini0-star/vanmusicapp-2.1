import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = 'vanz_music_google_user';
const HAS_PROMPTED_LOGIN_KEY = 'vanz_music_has_prompted_login';

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT', e);
    return null;
  }
}

export const authService = {
  getUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    listeners.forEach((cb) => cb(user));
  },

  logout() {
    this.setUser(null);
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.disableAutoSelect();
      } catch (e) {
        console.warn('Error disabling Google auto-select', e);
      }
    }
  },

  subscribe(listener: AuthListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  hasPromptedNewUser(): boolean {
    return localStorage.getItem(HAS_PROMPTED_LOGIN_KEY) === 'true';
  },

  setPromptedNewUser() {
    localStorage.setItem(HAS_PROMPTED_LOGIN_KEY, 'true');
  },

  handleCredentialResponse(response: any) {
    if (!response || !response.credential) return null;
    const payload = parseJwt(response.credential);
    if (!payload) return null;

    const user: UserProfile = {
      id: payload.sub || String(Date.now()),
      name: payload.name || payload.email?.split('@')[0] || 'Pengguna Google',
      email: payload.email || '',
      picture: payload.picture || '',
      givenName: payload.given_name,
      familyName: payload.family_name,
      loggedInAt: Date.now(),
    };

    authService.setUser(user);
    authService.setPromptedNewUser();
    return user;
  },
};
