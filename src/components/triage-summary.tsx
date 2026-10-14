import { CircleCheckIcon, ClockIcon, SirenIcon } from "lucide-react";
import type { TriageLevel } from "@/lib/schemas";
import { LEVEL_COPY, type TriageReason } from "@/lib/triage";
import { cn } from "@/lib/utils";

export const LEVEL_STYLES: Record<
  TriageLevel,
  { icon: typeof SirenIcon; badge: string; panel: string }
> = {
  urgent: {
    icon: SirenIcon,
    badge: "bg-red-600 text-white",
    panel: "border-red-200 bg-red-50/80",
  },
  soon: {
    icon: ClockIcon,
    badge: "bg-amber-500 text-amber-950",
    panel: "border-amber-200 bg-amber-50/80",
  },
  routine: {
    icon: CircleCheckIcon,
    badge: "bg-emerald-700 text-white",
    panel: "border-emerald-200 bg-emerald-50/70",
  },
};

export function TriageBadge({ level, className }: { level: TriageLevel; className?: string }) {
  const { icon: Icon, badge } = LEVEL_STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        badge,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {LEVEL_COPY[level].label}
    </span>
  );
}

export function TriageSummary({
  level,
  reasons,
  audience,
}: {
  level: TriageLevel;
  reasons: readonly TriageReason[];
  audience: "patient" | "provider";
}) {
  const { panel } = LEVEL_STYLES[level];

  return (
    <section
      aria-labelledby="triage-heading"
      aria-live="polite"
      className={cn("flex flex-col gap-4 rounded-2xl border p-4", panel)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="triage-heading" className="text-sm font-semibold">
          {audience === "patient" ? "How we'll route this" : "Automated triage"}
        </h3>
        <TriageBadge level={level} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Why: {reasons.length === 1 ? "1 rule" : `${reasons.length} rules`} fired
        </p>
        <ul className="flex flex-col gap-2">
          {reasons.map((reason) => (
            <li key={reason.rule} className="rounded-xl bg-background/80 p-3 text-sm shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-2">
                <code className="font-mono text-[11px] text-muted-foreground">{reason.rule}</code>
                <span className="text-[11px] font-medium text-muted-foreground">
                  → {LEVEL_COPY[reason.level].label}
                </span>
              </div>
              <p>{reason.message}</p>
            </li>
          ))}
        </ul>
      </div>

      {audience === "patient" ? (
        <div className={cn("rounded-xl p-3 text-sm", level === "urgent" ? "bg-red-600 text-white" : "bg-background/80")}>
          <p className="mb-0.5 font-semibold">What happens next</p>
          <p>{LEVEL_COPY[level].nextSteps}</p>
        </div>
      ) : null}
    </section>
  );
}
