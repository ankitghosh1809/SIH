import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ScreeningDisclaimer } from "./components/ScreeningDisclaimer";
import { SiteFooter } from "./components/SiteFooter";
import { RetinaScanIllustration } from "./components/RetinaScanIllustration";

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
      <section className="mx-auto max-w-5xl px-6 pt-14 pb-16 sm:pt-20">
        <div className="grid gap-10 md:grid-cols-5 md:items-center md:gap-12">
          <div className="md:col-span-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
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
              <Button asChild size="lg">
                <Link to={ROUTES.register}>
                  Create an account
                  <ArrowRight className="size-4" aria-hidden="true" />
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
            <RetinaScanIllustration className="mx-auto h-auto w-full max-w-xs" />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="border-t border-border bg-muted"
      >
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
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
          <ol className="mt-10 space-y-8 border-l-2 border-border pl-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(2rem+1px)] flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="project-heading"
        className="mx-auto max-w-5xl px-6 py-16"
      >
        <h2
          id="project-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
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

      <SiteFooter />
    </div>
  );
}
