import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

interface GuestOnlyRouteProps {
  children: ReactNode;
}

// The inverse of ProtectedRoute: for pages meant only for logged-out
// visitors (currently just About). Once a user is signed in, visiting the
// route directly — a stale bookmark, browser history, a leftover link in
// page content — redirects home instead of rendering the page, so it's
// genuinely not shown post-login, not just unlinked from the nav.
// <GuestOnlyRoute><AboutPage /></GuestOnlyRoute>
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <span className="text-sm text-muted-foreground">Loading, one moment.</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <>{children}</>;
}
