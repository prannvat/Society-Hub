import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { setApiAccessToken } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  loginWithAuth0: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = 'societyhub_access_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const issuer = process.env.EXPO_PUBLIC_AUTH0_ISSUER;
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;
  const authScheme = process.env.EXPO_PUBLIC_AUTH_SCHEME ?? 'societyhub';

  const discovery = issuer
    ? {
        authorizationEndpoint: `${issuer}/authorize`,
        tokenEndpoint: `${issuer}/oauth/token`,
        revocationEndpoint: `${issuer}/oauth/revoke`,
      }
    : null;

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: authScheme,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId ?? '',
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
      extraParams: audience ? { audience } : undefined,
    },
    discovery,
  );

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        setAccessToken(token);
        setApiAccessToken(token);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!response || response.type !== 'success') {
      return;
    }

    (async () => {
      if (!discovery?.tokenEndpoint || !request?.codeVerifier || !clientId) {
        return;
      }

      const code = response.params.code;
      if (!code) {
        return;
      }

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        {
          tokenEndpoint: discovery.tokenEndpoint,
        },
      );

      const token = tokenResult.accessToken;
      setAccessToken(token);
      setApiAccessToken(token);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    })();
  }, [clientId, discovery, redirectUri, request, response]);

  const loginWithAuth0 = async () => {
    if (!request || !discovery || !clientId) {
      return true;
    }

    const result = await promptAsync();
    return result.type === 'success';
  };

  const logout = async () => {
    setAccessToken(null);
    setApiAccessToken(null);
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: Boolean(accessToken),
      accessToken,
      loginWithAuth0,
      logout,
    }),
    [accessToken, isLoading],
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
