import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { SiteFooter } from "./components/SiteFooter";

const COLLECTED = [
  "Patient identifiers, so a scan can be matched back to the right person.",
  "Retinal fundus photos, and the heatmap images generated from them.",
  "Risk levels and predictions for diabetic retinopathy and cataract for each scan.",
  "A doctor's review notes, and any change a doctor makes to a risk level.",
  "Referral details, for patients referred on for a full clinical exam.",
  "Basic technical logs for security and audit purposes: who took an action, what the action was, an IP address, and a timestamp.",
];

const GAPS = [
  "We don't yet ask for your explicit consent before a scan is uploaded and processed.",
  "We don't yet have a policy for how long your data is kept, or a way to have it deleted. Right now, records are kept indefinitely.",
  "We haven't documented how images and records are protected in storage (encryption at rest), beyond whatever our hosting provider does by default.",
  "There's currently no way to request a copy of your data, or ask for it to be deleted.",
  "We don't yet have a published explanation of how your data is used, or a designated contact person for privacy questions or complaints.",
];

const PLANNED = [
  "Recording your consent at the time a scan is uploaded.",
  "A clear retention period for your data, with automatic deletion once it passes.",
  "A way to request a copy of your data, or ask us to delete it.",
  "A published, plain-language explanation of how your data is used, and someone to contact about it.",
];

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <section className="mx-auto max-w-3xl px-6 pt-14 pb-10 sm:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Privacy and your data
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          This page explains, in plain language, what SIH26139 collects and
          where our data practices currently stand. This is a
          hackathon-stage project, not a certified or legally reviewed
          compliance program. Please read this as an honest account of
          where things are today, not a guarantee of how a finished product
          would handle your data.
        </p>
      </section>

      <section
        aria-labelledby="collect-heading"
        className="border-t border-border bg-muted"
      >
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2
            id="collect-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            What we collect
          </h2>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            {COLLECTED.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="gaps-heading"
        className="mx-auto max-w-3xl px-6 py-14"
      >
        <h2
          id="gaps-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Where we currently fall short
        </h2>
        <p className="mt-4 text-muted-foreground">
          India's Digital Personal Data Protection Act 2023 sets out
          expectations for anyone handling personal data. We're not meeting
          all of them yet, and we'd rather say so plainly than use generic
          reassurance language that doesn't hold up.
        </p>
        <ul className="mt-6 space-y-3 text-muted-foreground">
          {GAPS.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-destructive"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="planned-heading"
        className="border-t border-border bg-muted"
      >
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2
            id="planned-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            What we're working on
          </h2>
          <p className="mt-4 text-muted-foreground">
            None of the following exists yet. These are the concrete,
            near-term changes we consider necessary before this system
            should handle any real patient data outside a hackathon or demo
            context.
          </p>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            {PLANNED.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-muted-foreground">
          We're sharing this openly because we think you should know where
          things actually stand, not where we'd like them to be. If you
          have questions about this project, see the{" "}
          <Link
            to={ROUTES.about}
            className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            About page
          </Link>{" "}
          for who built it.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
