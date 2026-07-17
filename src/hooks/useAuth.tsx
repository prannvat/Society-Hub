import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiError, setApiAccessToken } from '@/services/api/client';
import { ApiMeProfile, fetchMe } from '@/services/api/me';
import { AuthResponse, loginRequest, SignInInput, signUpRequest, SignUpInput } from '@/services/api/auth';

type AuthContextValue = {
  /** True while the stored session is being restored on app start. */
  isRestoring: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: ApiMeProfile | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = 'societyhub_access_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isRestoring, setIsRestoring] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiMeProfile | null>(null);

  // Restore a stored session on app start and validate it against /me.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (!token) {
          return;
        }

        setApiAccessToken(token);
        try {
          const me = await fetchMe();
          if (cancelled) {
            return;
          }
          setAccessToken(token);
          setUser(me);
        } catch (error) {
          if (error instanceof ApiError && error.statusCode === 401) {
            // Token is no longer valid — clear it.
            setApiAccessToken(null);
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          } else if (!cancelled) {
            // Network or server error: keep the session; the profile loads later.
            setAccessToken(token);
          }
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback(async (session: AuthResponse) => {
    setApiAccessToken(session.accessToken);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const signIn = useCallback(
    async (input: SignInInput) => {
      const session = await loginRequest(input);
      await applySession(session);
    },
    [applySession],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const session = await signUpRequest(input);
      await applySession(session);
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    setApiAccessToken(null);
    setAccessToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }, []);

  const value = useMemo(
    () => ({
      isRestoring,
      isAuthenticated: Boolean(accessToken),
      accessToken,
      user,
      signIn,
      signUp,
      signOut,
    }),
    [accessToken, isRestoring, user, signIn, signUp, signOut],
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
