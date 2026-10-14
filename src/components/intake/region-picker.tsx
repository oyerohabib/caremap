"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import { AREA_LABELS, REGION_IDS, REGIONS, type RegionArea, type RegionId } from "@/lib/regions";
import { cn } from "@/lib/utils";

const AREAS = Object.keys(AREA_LABELS) as RegionArea[];

/** Keyboard / screen-reader equivalent of tapping the 3D body. */
export function RegionPicker({
  selected,
  onToggle,
}: {
  selected: ReadonlySet<RegionId>;
  onToggle: (id: RegionId) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {AREAS.map((area) => (
        <fieldset key={area}>
          <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {AREA_LABELS[area]}
          </legend>
          <div className="flex flex-wrap gap-2">
            {REGION_IDS.filter((id) => REGIONS[id].area === area).map((id) => {
              const pressed = selected.has(id);
              const Icon = pressed ? CheckIcon : PlusIcon;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onToggle(id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-background px-3.5 text-sm font-medium transition-[background-color,border-color,color] duration-150 hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:min-h-9",
                    pressed && "border-brand bg-brand text-white hover:border-brand",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {REGIONS[id].label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
