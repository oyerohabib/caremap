import { TriangleAlertIcon } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="note"
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-amber-100 px-4 pt-[max(env(safe-area-inset-top),0.375rem)] pb-1.5 text-center text-xs font-medium text-amber-950"
    >
      <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>Demo: do not enter real health information.</span>
    </div>
  );
}
