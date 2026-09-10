import type { RouteObject } from "react-router-dom";
import { ROUTES, type NavItem } from "@/lib/routes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import UploadPage from "./UploadPage";
import BatchUploadPage from "./BatchUploadPage";

// Batch/camp mode is a health-worker workflow (screening many patients in
// one sitting) — not something a "patient"-role account should see or use.
const STAFF_ROLES = ["camp_staff", "doctor", "admin"] as const;

export const screeningRoutes: RouteObject[] = [
  {
    path: ROUTES.upload,
    element: (
      <ProtectedRoute>
        <UploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.batchUpload,
    element: (
      <ProtectedRoute roles={[...STAFF_ROLES]}>
        <BatchUploadPage />
      </ProtectedRoute>
    ),
  },
];

export const screeningNavItems: NavItem[] = [
  { label: "New Screening", path: ROUTES.upload },
  { label: "Batch / Camp Mode", path: ROUTES.batchUpload, roles: [...STAFF_ROLES] },
];
