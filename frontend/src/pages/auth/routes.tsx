import type { RouteObject } from "react-router-dom";

import type { NavItem } from "@/lib/routes";
import { ROUTES } from "@/lib/routes";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

export const authRoutes: RouteObject[] = [
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },
];

// Sign-in/sign-up live in Header's dedicated user-menu area, not the primary
// nav list, so there is nothing to contribute here.
export const authNavItems: NavItem[] = [];
