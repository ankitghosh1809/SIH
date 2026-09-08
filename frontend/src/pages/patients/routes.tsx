import type { RouteObject } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES, type NavItem } from "@/lib/routes";
import NewPatientPage from "./NewPatientPage";
import PatientDetailPage from "./PatientDetailPage";
import PatientListPage from "./PatientListPage";

export const patientsRoutes: RouteObject[] = [
  {
    path: ROUTES.patients,
    element: (
      <ProtectedRoute>
        <PatientListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.newPatient,
    element: (
      <ProtectedRoute>
        <NewPatientPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.patientDetail(":id"),
    element: (
      <ProtectedRoute>
        <PatientDetailPage />
      </ProtectedRoute>
    ),
  },
];

export const patientsNavItems: NavItem[] = [{ label: "Patients", path: ROUTES.patients }];
