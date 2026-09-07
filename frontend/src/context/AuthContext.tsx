/**
 * Intended path: frontend/src/context/AuthContext.tsx
 *
 * Auth state + actions for the app: { user, isAuthenticated, login,
 * logout, hasRole }. This does NOT include any login UI — it's the
 * logic layer the existing Foundation/Design/Auth login form should
 * call into ("reuse it, don't rebuild it").
 *
 * ASSUMPTIONS — UNVERIFIED, confirm against the real backend:
 *   - POST /api/v1/auth/login returns { token, user: { id, name, role, ... } }
 *   - GET  /api/v1/auth/me returns the current user, for rehydrating a
 *     session on page refresh. If this route doesn't exist, decode the
 *     role out of the JWT payload instead and swap that in below.
 *   - `role` is a single string, per task 3's "doctor and admin" — if
 *     the real model allows multiple roles per user, AuthUser.role
 *     becomes string[] and hasRole does an .includes check instead.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { getToken, setToken, clearToken, setNavigate } from '../lib/auth-utils';

export interface AuthUser {
  id: string;
  name: string;
  role: string; // e.g. 'doctor' | 'admin' — confirm the real values (task 3)
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
    navigate('/login');
  }

  function hasRole(...roles: string[]) {
    return !!user && roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
