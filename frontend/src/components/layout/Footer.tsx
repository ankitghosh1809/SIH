import { Link } from "react-router-dom";

import { ROUTES } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>SIH26139 Screening. Built for the Smart India Hackathon.</span>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <Link to={ROUTES.about} className="hover:text-foreground">
            About
          </Link>
          <Link to={ROUTES.privacy} className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
