import type { RouteObject } from "react-router-dom";
import { ROUTES, type NavItem } from "@/lib/routes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import UploadPage from "./UploadPage";
import BatchUploadPage from "./BatchUploadPage";

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
      <ProtectedRoute>
        <BatchUploadPage />
      </ProtectedRoute>
    ),
  },
];

export const screeningNavItems: NavItem[] = [
  { label: "New Screening", path: ROUTES.upload },
  { label: "Batch / Camp Mode", path: ROUTES.batchUpload },
];
