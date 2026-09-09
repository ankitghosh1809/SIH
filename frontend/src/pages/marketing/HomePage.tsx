import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { ScreeningDisclaimer } from "./components/ScreeningDisclaimer";
import { SiteFooter } from "./components/SiteFooter";
import { RetinaScanIllustration } from "./components/RetinaScanIllustration";
import { useRevealOnScroll } from "./hooks/useRevealOnScroll";

const STEPS = [
  {
    title: "Capture a photo",
    description:
      "A health worker takes a retinal fundus photo at a screening camp or clinic.",
  },
  {
    title: "The model analyzes it",
    description:
      "A hybrid classical and quantum machine learning model checks the image for signs of diabetic retinopathy and cataract.",
  },
  {
    title: "A risk level, not a diagnosis",
    description:
      "The system reports a risk level for each condition. It flags what deserves a closer look, and does not diagnose disease on its own.",
  },
  {
    title: "A doctor reviews it",
    description:
      "Every result is checked by a doctor before it reaches a patient or their family. A doctor can confirm, adjust, or override it.",
  },
  {
    title: "Referral, if needed",
    description:
      "If risk is elevated, the patient is referred for a full clinical eye exam, with the screening result attached for the specialist's reference.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-ink">
      {/* Hero. Committed fully dark (not a light page with one dark
          section) — see index.css for why. Ambient glow + grain keep the
          dark field from reading as flat. */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] size-[560px] rounded-full bg-ink-accent/20 blur-[140px]"
        />
        <div aria-hidden="true" className="bg-noise pointer-events-none absolute inset-0 opacity-[0.05]" />

        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-24">
          <div className="grid gap-12 md:grid-cols-5 md:items-center md:gap-12">
            <div className="md:col-span-3">
              <Badge
                variant="outline"
                className="border-ink-accent/30 bg-ink-accent/10 tracking-wide text-ink-accent uppercase"
              >
                SIH26139 &middot; Hybrid quantum ML screening
              </Badge>
              <h1 className="mt-5 text-5xl font-semibold tracking-tighter text-balance text-ink-foreground sm:text-6xl lg:text-7xl">
                Diabetic retinopathy and cataract screening, from one
                retinal photo.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink-muted">
                SIH26139 uses a hybrid classical and quantum machine learning
                model to flag early signs of diabetic eye disease at screening
                camps and clinics, so a doctor can review sooner and refer the
                patients who need it.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="group rounded-full bg-ink-accent pr-2 pl-6 text-ink shadow-glow hover:bg-ink-accent-bright"
                >
                  <Link to={ROUTES.register}>
                    Create an account
                    <span className="ml-1 flex size-7 items-center justify-center rounded-full bg-ink/15 transition-transform duration-200 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Link
                  to={ROUTES.login}
                  className="rounded-sm text-sm font-medium text-ink-foreground underline-offset-4 hover:text-ink-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-accent"
                >
                  Already have an account? Log in
                </Link>
              </div>
              <ScreeningDisclaimer className="mt-8 border-transparent bg-white shadow-glow" />
            </div>
            <div className="md:col-span-2">
              <div className="mx-auto max-w-xs rounded-[2rem] border border-white/10 bg-white/[0.02] p-8">
                <RetinaScanIllustration className="h-auto w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <ProjectSection />
      <SiteFooter />
    </div>
  );
}

function HowItWorksSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section aria-labelledby="how-it-works-heading" className="border-t border-ink-border">
      <div ref={ref} className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <Badge
          variant="outline"
          className="border-white/15 bg-white/5 tracking-wide text-ink-muted uppercase"
        >
          The pipeline
        </Badge>
        <h2
          id="how-it-works-heading"
          className="mt-4 text-2xl font-semibold tracking-tight text-balance text-ink-foreground sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          The pipeline behind every screening, from photo to a doctor's
          review. This is a hackathon-stage build. See the{" "}
          <Link
            to={ROUTES.about}
            className="rounded-sm text-ink-foreground underline-offset-4 hover:text-ink-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-accent"
          >
            About page
          </Link>{" "}
          for where the model itself stands today.
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              style={{ transitionDelay: revealed ? `${index * 90}ms` : "0ms" }}
              className={cn(
                "rounded-lg border border-white/10 bg-white/[0.035] p-5 transition-[opacity,transform,filter,background-color] duration-700 ease-spring hover:bg-white/[0.06]",
                revealed
                  ? "translate-y-0 opacity-100 blur-none"
                  : "translate-y-7 opacity-0 blur-sm",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-ink-accent text-sm font-semibold text-ink"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold text-ink-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProjectSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section
      aria-labelledby="project-heading"
      ref={ref}
      className={cn(
        "mx-auto max-w-5xl border-t border-ink-border px-6 py-20 transition-[opacity,transform,filter] duration-700 ease-spring sm:py-24",
        revealed ? "translate-y-0 opacity-100 blur-none" : "translate-y-7 opacity-0 blur-sm",
      )}
    >
      <h2
        id="project-heading"
        className="text-2xl font-semibold tracking-tight text-balance text-ink-foreground sm:text-3xl"
      >
        Built for Smart India Hackathon 2026
      </h2>
      <p className="mt-4 max-w-2xl text-ink-muted">
        SIH26139 is a student-built project for Smart India Hackathon
        2026, sponsored by Egreen Quanta. A small team built the backend,
        the frontend, and the machine learning model behind it.
      </p>
      <Link
        to={ROUTES.about}
        className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-ink-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-accent"
      >
        Read more about the project and the team
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
