import type { RouteObject } from "react-router-dom";
import { GuestOnlyRoute } from "@/components/GuestOnlyRoute";
import { ROUTES, type NavItem } from "@/lib/routes";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import PrivacyPage from "./PrivacyPage";
import NotFoundPage from "./NotFoundPage";

export const marketingRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <HomePage /> },
  {
    path: ROUTES.about,
    element: (
      <GuestOnlyRoute>
        <AboutPage />
      </GuestOnlyRoute>
    ),
  },
  { path: ROUTES.privacy, element: <PrivacyPage /> },
  { path: "*", element: <NotFoundPage /> }, // catch-all — must stay last in App.tsx's route array
];

// guestOnly: About is for logged-out visitors; once signed in it disappears
// from the nav (see Sidebar's useVisibleNavItems) and the route itself
// redirects home (see GuestOnlyRoute above) if reached another way.
export const marketingNavItems: NavItem[] = [
  { label: "About", path: ROUTES.about, guestOnly: true },
];
