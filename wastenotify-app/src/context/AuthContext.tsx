import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearToken,
  fetchMe,
  getToken,
  login as loginRequest,
  logoutRequest,
  register as registerRequest,
  setToken,
  type RegisterInput,
  type User,
} from '../lib/api';
import { disablePush, enablePush } from '../lib/push';

interface AuthState {
  user: User | null;
  /** True until the stored token has been checked — routes must wait on this. */
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  /** Re-pull the current user so edits made elsewhere show in the shell. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On boot, a stored token might be revoked or expired. Verify it against the
  // server rather than trusting its presence, so the app never renders a
  // signed-in shell for a session the API will reject.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        await clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await loginRequest(email, password);
    await setToken(payload.token);
    setUser(payload.user);
    // After the token is stored, so the /devices call is authenticated.
    // Deliberately not awaited: push is optional and must never delay landing
    // on the home screen.
    void enablePush();
    return payload.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const payload = await registerRequest(input);
    await setToken(payload.token);
    setUser(payload.user);
    void enablePush();
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    // Before the token is revoked — unregistering needs an authenticated
    // request, and a stale registration would keep delivering this account's
    // reports to a handset somebody else may now be using.
    await disablePush();

    try {
      await logoutRequest();
    } catch {
      // A failed revoke (offline, already-expired token) must not trap the
      // user in a signed-in state — drop the local session either way.
    }
    await clearToken();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      // A failed refresh shouldn't sign anyone out — the existing session is
      // still valid as far as we know, and the caller just wanted newer data.
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: !!user?.is_admin,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
