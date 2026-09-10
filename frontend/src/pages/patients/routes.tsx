import type { RouteObject } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES, type NavItem } from "@/lib/routes";
import NewPatientPage from "./NewPatientPage";
import PatientDetailPage from "./PatientDetailPage";
import PatientListPage from "./PatientListPage";

// The patient registry is a health-worker/clinician tool for browsing and
// managing *other people's* records — a "patient"-role account has no
// business here, both for nav clarity and because it'd otherwise be able
// to browse other patients' data directly by URL.
const STAFF_ROLES = ["camp_staff", "doctor", "admin"] as const;

export const patientsRoutes: RouteObject[] = [
  {
    path: ROUTES.patients,
    element: (
      <ProtectedRoute roles={[...STAFF_ROLES]}>
        <PatientListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.newPatient,
    element: (
      <ProtectedRoute roles={[...STAFF_ROLES]}>
        <NewPatientPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.patientDetail(":id"),
    element: (
      <ProtectedRoute roles={[...STAFF_ROLES]}>
        <PatientDetailPage />
      </ProtectedRoute>
    ),
  },
];

export const patientsNavItems: NavItem[] = [
  { label: "Patients", path: ROUTES.patients, roles: [...STAFF_ROLES] },
];
