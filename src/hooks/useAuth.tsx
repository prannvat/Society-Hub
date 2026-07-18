import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiError, setApiAccessToken } from '@/services/api/client';
import { ApiMeProfile, fetchMe } from '@/services/api/me';
import { AuthResponse, loginRequest, SignInInput, signUpRequest, SignUpInput } from '@/services/api/auth';

/** One logged-in account. The app can hold several at once (Instagram-style). */
export type StoredSession = {
  accessToken: string;
  user: ApiMeProfile;
};

export type AccountSummary = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
};

type AuthContextValue = {
  /** True while stored sessions are being restored on app start. */
  isRestoring: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: ApiMeProfile | null;
  activeUserId: string | null;
  /** All logged-in accounts, for the account switcher. */
  accounts: AccountSummary[];
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  switchAccount: (userId: string) => Promise<void>;
  /** Signs out the active account; if others remain, switches to one of them. */
  signOut: () => Promise<void>;
  /** Signs out every account. */
  signOutAll: () => Promise<void>;
  /**
   * Re-reads the active account from `/me` and updates the stored session.
   * Call after editing your own profile so username/links/avatar stay in sync.
   */
  refreshUser: () => Promise<void>;
};

const SESSIONS_KEY = 'societyhub_sessions';
const LEGACY_TOKEN_KEY = 'societyhub_access_token';

type PersistedState = { activeUserId: string | null; sessions: StoredSession[] };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const active = sessions.find((s) => s.user.id === activeUserId) ?? null;

  const persist = useCallback(async (state: PersistedState) => {
    await SecureStore.setItemAsync(SESSIONS_KEY, JSON.stringify(state));
  }, []);

  // Restore stored sessions (migrating the old single-token key) on app start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSIONS_KEY);
        let restored: PersistedState | null = raw ? (JSON.parse(raw) as PersistedState) : null;

        // Migrate a legacy single-token session into the new multi-session store.
        if (!restored) {
          const legacy = await SecureStore.getItemAsync(LEGACY_TOKEN_KEY);
          if (legacy) {
            setApiAccessToken(legacy);
            try {
              const me = await fetchMe();
              restored = { activeUserId: me.id, sessions: [{ accessToken: legacy, user: me }] };
              await persist(restored);
              await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
            } catch {
              restored = null;
            }
          }
        }

        if (!restored || restored.sessions.length === 0) return;

        const act = restored.sessions.find((s) => s.user.id === restored!.activeUserId) ?? restored.sessions[0];
        setApiAccessToken(act.accessToken);
        if (cancelled) return;
        setSessions(restored.sessions);
        setActiveUserId(act.user.id);

        // Validate the active token; refresh its profile.
        try {
          const me = await fetchMe();
          if (cancelled) return;
          setSessions((prev) => prev.map((s) => (s.user.id === me.id ? { ...s, user: me } : s)));
        } catch (error) {
          if (error instanceof ApiError && error.statusCode === 401) {
            // Active token dead — drop that session.
            const remaining = restored.sessions.filter((s) => s.user.id !== act.user.id);
            const next = remaining[0] ?? null;
            setApiAccessToken(next?.accessToken ?? null);
            setSessions(remaining);
            setActiveUserId(next?.user.id ?? null);
            await persist({ activeUserId: next?.user.id ?? null, sessions: remaining });
          }
        }
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  /** Add or replace a session (by user id) and make it active. */
  const applySession = useCallback(
    async (session: AuthResponse) => {
      setApiAccessToken(session.accessToken);
      setSessions((prev) => {
        const others = prev.filter((s) => s.user.id !== session.user.id);
        const next = [...others, { accessToken: session.accessToken, user: session.user }];
        void persist({ activeUserId: session.user.id, sessions: next });
        return next;
      });
      setActiveUserId(session.user.id);
    },
    [persist],
  );

  const signIn = useCallback(async (input: SignInInput) => applySession(await loginRequest(input)), [applySession]);
  const signUp = useCallback(async (input: SignUpInput) => applySession(await signUpRequest(input)), [applySession]);

  const switchAccount = useCallback(
    async (userId: string) => {
      const target = sessions.find((s) => s.user.id === userId);
      if (!target || userId === activeUserId) return;
      setApiAccessToken(target.accessToken);
      setActiveUserId(userId);
      await persist({ activeUserId: userId, sessions });
      // Refresh the switched-to profile in the background.
      try {
        const me = await fetchMe();
        setSessions((prev) => prev.map((s) => (s.user.id === me.id ? { ...s, user: me } : s)));
      } catch {
        // keep the stored snapshot
      }
    },
    [sessions, activeUserId, persist],
  );

  const signOut = useCallback(async () => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.user.id !== activeUserId);
      const next = remaining[0] ?? null;
      setApiAccessToken(next?.accessToken ?? null);
      setActiveUserId(next?.user.id ?? null);
      void persist({ activeUserId: next?.user.id ?? null, sessions: remaining });
      return remaining;
    });
  }, [activeUserId, persist]);

  const refreshUser = useCallback(async () => {
    if (!activeUserId) return;
    const me = await fetchMe();
    setSessions((prev) => {
      const next = prev.map((s) => (s.user.id === me.id ? { ...s, user: me } : s));
      void persist({ activeUserId: me.id, sessions: next });
      return next;
    });
  }, [activeUserId, persist]);

  const signOutAll = useCallback(async () => {
    setApiAccessToken(null);
    setSessions([]);
    setActiveUserId(null);
    await SecureStore.deleteItemAsync(SESSIONS_KEY);
  }, []);

  const accounts: AccountSummary[] = useMemo(
    () =>
      sessions.map((s) => ({
        userId: s.user.id,
        fullName: s.user.fullName,
        email: s.user.email,
        avatarUrl: s.user.avatarUrl ?? null,
        isActive: s.user.id === activeUserId,
      })),
    [sessions, activeUserId],
  );

  const value = useMemo(
    () => ({
      isRestoring,
      isAuthenticated: Boolean(active),
      accessToken: active?.accessToken ?? null,
      user: active?.user ?? null,
      activeUserId,
      accounts,
      signIn,
      signUp,
      switchAccount,
      signOut,
      signOutAll,
      refreshUser,
    }),
    [isRestoring, active, activeUserId, accounts, signIn, signUp, switchAccount, signOut, signOutAll, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
