import { severityColor, severityLabel } from "@/lib/severity";
import { cn } from "@/lib/utils";

/** Number + word + colour dot, so severity never relies on colour alone. */
export function SeverityBadge({ severity, className }: { severity: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border bg-background px-2 py-0.5 text-xs font-medium tabular-nums",
        className,
      )}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: severityColor(severity) }}
        aria-hidden="true"
      />
      {severity}/10 · {severityLabel(severity)}
    </span>
  );
}
