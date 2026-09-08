import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import type { NavItem } from "@/lib/routes";
import { adminNavItems, adminRoutes } from "@/pages/admin/routes";
import { authNavItems, authRoutes } from "@/pages/auth/routes";
import { marketingNavItems, marketingRoutes } from "@/pages/marketing/routes";
import { patientsNavItems, patientsRoutes } from "@/pages/patients/routes";
import { reviewNavItems, reviewRoutes } from "@/pages/review/routes";
import { scansNavItems, scansRoutes } from "@/pages/scans/routes";
import { screeningNavItems, screeningRoutes } from "@/pages/screening/routes";

// All seven feature route arrays. Agents 2-7 each replace one placeholder
// import's target file at stitch time; this list itself never changes.
const allRoutes = [
  ...authRoutes,
  ...marketingRoutes,
  ...screeningRoutes,
  ...scansRoutes,
  ...patientsRoutes,
  ...reviewRoutes,
  ...adminRoutes,
];

const allNavItems: NavItem[] = [
  ...authNavItems,
  ...marketingNavItems,
  ...screeningNavItems,
  ...scansNavItems,
  ...patientsNavItems,
  ...reviewNavItems,
  ...adminNavItems,
];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell navItems={allNavItems}>
          <Routes>
            {allRoutes.map((route) => (
              <Route key={String(route.path)} path={route.path} element={route.element} />
            ))}
          </Routes>
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
