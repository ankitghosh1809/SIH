import type { RouteObject } from "react-router-dom";
import { ROUTES, type NavItem } from "@/lib/routes";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import PrivacyPage from "./PrivacyPage";
import MusicHeroShowcase from "./MusicHeroShowcase";
import NotFoundPage from "./NotFoundPage";

export const marketingRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <HomePage /> },
  { path: ROUTES.about, element: <AboutPage /> },
  { path: ROUTES.privacy, element: <PrivacyPage /> },
  { path: ROUTES.musicHeroShowcase, element: <MusicHeroShowcase /> },
  { path: "*", element: <NotFoundPage /> }, // catch-all — must stay last in App.tsx's route array
];

export const marketingNavItems: NavItem[] = [
  { label: "About", path: ROUTES.about },
];
