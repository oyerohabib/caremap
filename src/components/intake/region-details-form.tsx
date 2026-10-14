"use client";

import { Trash2Icon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { regionLabel } from "@/lib/regions";
import { DURATION_OPTIONS, QUALITY_LABELS, SYMPTOM_QUALITIES } from "@/lib/schemas";
import { severityColor, severityLabel } from "@/lib/severity";
import { cn } from "@/lib/utils";
import type { DraftRegion } from "@/stores/intake-draft";

type Patch = Partial<Omit<DraftRegion, "regionId">>;

function ChipRadioGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center rounded-full border bg-background px-3 text-sm transition-colors duration-150 hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 md:min-h-8",
              "has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white",
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function RegionDetailsForm({
  region,
  onChange,
  onDone,
  onRemove,
}: {
  region: DraftRegion;
  onChange: (patch: Patch) => void;
  onDone: () => void;
  onRemove: () => void;
}) {
  const id = useId();
  const label = regionLabel(region.regionId);

  return (
    <form
      className="flex flex-col gap-5"
      aria-label={`Details for ${label}`}
      onSubmit={(e) => {
        e.preventDefault();
        onDone();
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span id={`${id}-severity`} className="text-sm font-medium">
            How bad is it right now?
          </span>
          <output
            htmlFor={`${id}-severity`}
            className="flex items-center gap-1.5 text-sm font-semibold tabular-nums"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: severityColor(region.severity) }}
              aria-hidden="true"
            />
            {region.severity}/10 · {severityLabel(region.severity)}
          </output>
        </div>
        <Slider
          aria-labelledby={`${id}-severity`}
          min={0}
          max={10}
          step={1}
          value={[region.severity]}
          onValueChange={(value) => onChange({ severity: Array.isArray(value) ? value[0] : value })}
          getAriaLabel={() => `Severity for ${label}`}
          getAriaValueText={(_, value) => `${value} out of 10, ${severityLabel(value)}`}
          className="py-2"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
          <span>0 · None</span>
          <span>10 · Worst imaginable</span>
        </div>
      </div>

      <ChipRadioGroup
        legend="What does it feel like?"
        name={`${id}-quality`}
        options={SYMPTOM_QUALITIES.map((q) => ({ value: q, label: QUALITY_LABELS[q] }))}
        value={region.quality}
        onChange={(quality) => onChange({ quality })}
      />

      <ChipRadioGroup
        legend="How long has it been going on?"
        name={`${id}-duration`}
        options={DURATION_OPTIONS.map((d) => ({ value: d.days, label: d.label }))}
        value={region.durationDays}
        onChange={(durationDays) => onChange({ durationDays })}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-notes`} className="text-sm font-medium">
          Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id={`${id}-notes`}
          value={region.notes}
          maxLength={500}
          rows={2}
          placeholder="e.g. worse when I climb stairs"
          onChange={(e) => onChange({ notes: e.target.value })}
          aria-describedby={`${id}-notes-hint`}
        />
        <p id={`${id}-notes-hint`} className="text-xs text-muted-foreground">
          Don&apos;t include names, dates of birth or other identifiers.
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="lg" className="h-11 flex-1">
          Save {label.toLowerCase()}
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={onRemove}>
          <Trash2Icon aria-hidden="true" />
          <span>Remove</span>
        </Button>
      </div>
    </form>
  );
}
