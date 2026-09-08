import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { ScreeningDisclaimer } from "./components/ScreeningDisclaimer";
import { SiteFooter } from "./components/SiteFooter";

const TEAM = [
  { name: "Ankit", role: "Backend and database" },
  { name: "Sheya and Shravani", role: "Frontend and UI" },
  {
    name: "Arushi and Pramati",
    role: "Machine learning and quantum modelling",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="mx-auto max-w-3xl px-6 pt-14 pb-10 sm:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          About SIH26139
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          SIH26139 is a Smart India Hackathon 2026 project built around a
          simple problem: many screening camps and smaller clinics don't
          have a specialist ophthalmologist on site to check every patient's
          eyes for diabetic retinopathy and cataract. This project screens a
          retinal photo for signs of both conditions, using a hybrid
          classical and quantum machine learning model, so the people who
          need a closer look can get one sooner.
        </p>
        <ScreeningDisclaimer className="mt-8" />
      </section>

      <section
        aria-labelledby="team-heading"
        className="border-t border-border bg-muted"
      >
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2
            id="team-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            The team
          </h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Project team and roles</caption>
              <thead className="bg-muted">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-foreground"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold text-foreground"
                  >
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {TEAM.map((member, i) => (
                  <tr
                    key={member.name}
                    className={i % 2 === 1 ? "bg-background" : undefined}
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-foreground"
                    >
                      {member.name}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-muted-foreground">
            SIH26139 is sponsored by Egreen Quanta, a quantum computing
            research and development company.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="status-heading"
        className="mx-auto max-w-3xl px-6 py-14"
      >
        <h2
          id="status-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Where things stand today
        </h2>
        <p className="mt-4 text-muted-foreground">
          This is a hackathon build, and we want to be upfront about what
          that means in practice. The screening pipeline you see today runs
          on a placeholder model with the same interface the real hybrid
          quantum model will use. Arushi and Pramati are still training and
          validating that model. Until it's ready, risk levels produced by
          this system reflect a placeholder, not a validated clinical model,
          and shouldn't be read as more reliable than that.
        </p>
        <p className="mt-4 text-muted-foreground">
          We'll update this page once the trained model is in place. Every
          result still goes through a doctor's review before it reaches
          anyone, exactly as it would once the final model is live.
        </p>
        <Link
          to={ROUTES.privacy}
          className="mt-6 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Read what data we collect and where our privacy practices stand
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
