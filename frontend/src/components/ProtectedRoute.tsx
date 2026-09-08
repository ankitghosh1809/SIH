import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  // Omitted => any logged-in user, regardless of role.
  roles?: UserRole[];
  children: ReactNode;
}

// <ProtectedRoute roles={["admin", "doctor"]}><SomePage /></ProtectedRoute>
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const hasWrongRole = Boolean(user) && Boolean(roles) && !roles?.includes(user!.role);

  useEffect(() => {
    if (hasWrongRole) {
      toast.error("You don't have access to that page.");
    }
  }, [hasWrongRole]);

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

  if (!user) {
    // Preserve the intended destination so LoginPage can send the user back
    // here after a successful login.
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (hasWrongRole) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <>{children}</>;
}
