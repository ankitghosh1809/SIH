/**
 * Intended path: frontend/src/components/ProtectedRoute.tsx
 *
 * Route guard for react-router-dom v6 (task 3). Usage:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 *
 * IMPORTANT: this is a UX guard, not a security boundary — the backend
 * must enforce the same role checks server-side (see
 * SECURITY_CHECKLIST.md, item 4). Anyone can edit the JS running in
 * their own browser.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // swap in the design system's existing loading/spinner state

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/" replace />; // wrong role — safe default, not a dead end
  }

  return <Outlet />;
}
