import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { SiteFooter } from "./components/SiteFooter";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Button asChild className="mt-8">
          <Link to={ROUTES.home}>Back to home</Link>
        </Button>
      </section>
      <SiteFooter />
    </div>
  );
}
