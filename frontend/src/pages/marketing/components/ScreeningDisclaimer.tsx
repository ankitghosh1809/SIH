import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one statement the work order calls "load-bearing": visible and
 * unavoidable, not buried in fine print. Used on Home and About. Keep the
 * wording here in sync if it ever changes; every other use should read
 * from this component, not repeat its own copy of the sentence.
 */
export function ScreeningDisclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground",
        className
      )}
    >
      <ShieldAlert
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-primary"
      />
      <p>
        <span className="font-semibold">
          This is a screening aid, not a diagnosis.
        </span>{" "}
        Every result is reviewed by a doctor before it is shared with a
        patient or their family.
      </p>
    </div>
  );
}
