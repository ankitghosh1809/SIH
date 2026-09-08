import type { RouteObject } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES, type NavItem } from "@/lib/routes";

import AdminDashboardPage from "./AdminDashboardPage";
import AuditLogPage from "./AuditLogPage";
import NotificationsPage from "./NotificationsPage";

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.admin,
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.auditLog,
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AuditLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.notifications,
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
];

export const adminNavItems: NavItem[] = [
  { label: "Admin Dashboard", path: ROUTES.admin, roles: ["admin"] },
  { label: "Audit Log", path: ROUTES.auditLog, roles: ["admin"] },
  { label: "Notifications", path: ROUTES.notifications },
];
