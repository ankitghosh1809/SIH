import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const FOOTER_LINKS = [
  { label: "About", path: ROUTES.about },
  { label: "Privacy", path: ROUTES.privacy },
  { label: "Log in", path: ROUTES.login },
  { label: "Register", path: ROUTES.register },
];

/**
 * Rendered at the bottom of every page in src/pages/marketing/. Not part
 * of Agent 1's shared nav (that's what marketingNavItems in routes.tsx
 * feeds), so this is the one place these links live for a signed-out
 * visitor.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-foreground">SIH26139</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A screening aid for diabetic retinopathy and cataract, built
              for Smart India Hackathon 2026 and sponsored by Egreen Quanta.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="rounded-sm text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          Screening results are not a medical diagnosis. Every result is
          reviewed by a doctor before it is shared.
        </p>
      </div>
    </footer>
  );
}
