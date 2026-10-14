import { cn } from "@/lib/utils";
import type { IntakeStep } from "@/stores/intake-draft";

const STEPS: { id: IntakeStep; label: string }[] = [
  { id: "select", label: "Where" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
  { id: "submitted", label: "Sent" },
];

export function Stepper({ step }: { step: IntakeStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-1.5" aria-label="Intake progress">
      {STEPS.map((s, i) => (
        <li
          key={s.id}
          aria-current={i === currentIndex ? "step" : undefined}
          className="flex flex-1 flex-col gap-1.5"
        >
          <span
            className={cn(
              "h-1 rounded-full bg-muted transition-colors duration-300",
              i <= currentIndex && "bg-brand",
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-[11px] font-medium text-muted-foreground",
              i === currentIndex && "text-foreground",
            )}
          >
            <span className="sr-only">
              Step {i + 1} of {STEPS.length}:{" "}
            </span>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
