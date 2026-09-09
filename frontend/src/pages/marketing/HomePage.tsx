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
    <div className="bg-background">
      <section className="mx-auto max-w-5xl px-6 pt-14 pb-20 sm:pt-24 sm:pb-24">
        <div className="grid gap-10 md:grid-cols-5 md:items-center md:gap-12">
          <div className="md:col-span-3">
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/5 tracking-wide text-primary uppercase"
            >
              SIH26139 &middot; Hybrid quantum ML screening
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              Diabetic retinopathy and cataract screening, from one retinal
              photo.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SIH26139 uses a hybrid classical and quantum machine learning
              model to flag early signs of diabetic eye disease at screening
              camps and clinics, so a doctor can review sooner and refer the
              patients who need it.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group rounded-full pl-6 pr-2">
                <Link to={ROUTES.register}>
                  Create an account
                  <span className="ml-1 flex size-7 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-200 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Link
                to={ROUTES.login}
                className="rounded-sm text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Already have an account? Log in
              </Link>
            </div>
            <ScreeningDisclaimer className="mt-8" />
          </div>
          <div className="md:col-span-2">
            <div className="mx-auto max-w-xs rounded-[1.75rem] border border-border bg-muted/40 p-6 shadow-soft-lg">
              <RetinaScanIllustration className="h-auto w-full" />
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
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-border bg-muted"
    >
      <div ref={ref} className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <Badge
          variant="outline"
          className="border-border bg-background tracking-wide text-muted-foreground uppercase"
        >
          The pipeline
        </Badge>
        <h2
          id="how-it-works-heading"
          className="mt-4 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The pipeline behind every screening, from photo to a doctor's
          review. This is a hackathon-stage build. See the{" "}
          <Link
            to={ROUTES.about}
            className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                "rounded-lg border border-border bg-card p-5 shadow-soft transition-[opacity,transform,filter] duration-700 ease-spring",
                revealed
                  ? "translate-y-0 opacity-100 blur-none"
                  : "translate-y-7 opacity-0 blur-sm",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
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
        "mx-auto max-w-5xl px-6 py-20 transition-[opacity,transform,filter] duration-700 ease-spring sm:py-24",
        revealed ? "translate-y-0 opacity-100 blur-none" : "translate-y-7 opacity-0 blur-sm",
      )}
    >
      <h2
        id="project-heading"
        className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
      >
        Built for Smart India Hackathon 2026
      </h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        SIH26139 is a student-built project for Smart India Hackathon
        2026, sponsored by Egreen Quanta. A small team built the backend,
        the frontend, and the machine learning model behind it.
      </p>
      <Link
        to={ROUTES.about}
        className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Read more about the project and the team
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
