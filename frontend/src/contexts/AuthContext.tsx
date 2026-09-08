import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, setOnUnauthorized, TOKEN_STORAGE_KEY } from "@/lib/api-client";
import type { Token, UserCreate, UserResponse } from "@/types/api";

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: UserCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setAuthHeader(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stores the token in both localStorage and axios defaults, per Task 4.
  // (The request interceptor in api-client.ts also reads localStorage fresh
  // on every request; setting the axios default here too means the token is
  // available immediately, synchronously, to any code that inspects axios's
  // defaults directly.)
  const applyToken = useCallback((nextToken: string | null) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setAuthHeader(nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  // Register the shared 401 handler so a token that expires mid-session logs
  // the user out from wherever the 401 happened to occur, without
  // api-client.ts needing to import this file back (that would be circular).
  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  // On mount, re-validate any token already in localStorage via /me rather
  // than trusting it blindly. It may have expired since the last visit.
  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!existingToken) {
      setIsLoading(false);
      return;
    }
    setAuthHeader(existingToken);
    api
      .get<UserResponse>("/api/v1/auth/me")
      .then((response) => {
        setToken(existingToken);
        setUser(response.data);
      })
      .catch(() => {
        applyToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      // The one call in the whole app that is NOT plain JSON: the backend's
      // /auth/login expects OAuth2PasswordRequestForm, i.e. form-encoded.
      const body = new URLSearchParams({ username, password });
      const response = await api.post<Token>("/api/v1/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      applyToken(response.data.access_token);
      const me = await api.get<UserResponse>("/api/v1/auth/me");
      setUser(me.data);
    },
    [applyToken]
  );

  const register = useCallback(async (payload: UserCreate) => {
    await api.post<UserResponse>("/api/v1/auth/register", payload);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
