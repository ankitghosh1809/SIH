import type { RouteObject } from "react-router-dom";
import { ROUTES, type NavItem } from "@/lib/routes";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import PrivacyPage from "./PrivacyPage";
import NotFoundPage from "./NotFoundPage";

export const marketingRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <HomePage /> },
  { path: ROUTES.about, element: <AboutPage /> },
  { path: ROUTES.privacy, element: <PrivacyPage /> },
  { path: "*", element: <NotFoundPage /> }, // catch-all — must stay last in App.tsx's route array
];

// About stays reachable via SiteFooter, just not in the persistent nav —
// logged-out visitors should see only "Login" here, and logged-in users
// don't need a marketing page in their working nav at all.
export const marketingNavItems: NavItem[] = [
  { label: "Login", path: ROUTES.login, guestOnly: true },
];
