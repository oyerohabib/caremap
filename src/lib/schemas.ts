import { z } from "zod";
import { REGION_IDS } from "./regions";

export const SYMPTOM_QUALITIES = [
  "aching",
  "sharp",
  "burning",
  "throbbing",
  "tingling",
  "stiffness",
  "other",
] as const;

export const QUALITY_LABELS: Record<(typeof SYMPTOM_QUALITIES)[number], string> = {
  aching: "Aching",
  sharp: "Sharp / stabbing",
  burning: "Burning",
  throbbing: "Throbbing",
  tingling: "Numbness / tingling",
  stiffness: "Stiffness",
  other: "Something else",
};

export const DURATION_OPTIONS = [
  { days: 0, label: "Less than a day" },
  { days: 1, label: "About a day" },
  { days: 3, label: "2–3 days" },
  { days: 7, label: "About a week" },
  { days: 14, label: "About two weeks" },
  { days: 21, label: "3+ weeks" },
  { days: 60, label: "Two months or more" },
] as const;

export const TRIAGE_LEVELS = ["routine", "soon", "urgent"] as const;
export const INTAKE_STATUSES = ["submitted", "reviewed"] as const;
export const AUDIT_ACTORS = ["patient", "system", "provider"] as const;

export const regionIdSchema = z.enum(REGION_IDS);
export const symptomQualitySchema = z.enum(SYMPTOM_QUALITIES);
export const triageLevelSchema = z.enum(TRIAGE_LEVELS);

export const pinSchema = z.object({
  x: z.number().finite().min(-3).max(3),
  y: z.number().finite().min(-1).max(3),
  z: z.number().finite().min(-3).max(3),
});

export const intakeRegionSchema = z.object({
  regionId: regionIdSchema,
  severity: z.number().int().min(0).max(10),
  quality: symptomQualitySchema,
  durationDays: z.number().int().min(0).max(365),
  notes: z.string().trim().max(500).default(""),
  pin: pinSchema.nullable().default(null),
});

export const createIntakeSchema = z.object({
  regions: z
    .array(intakeRegionSchema)
    .min(1, "Select at least one area")
    .max(REGION_IDS.length)
    .refine(
      (regions) => new Set(regions.map((r) => r.regionId)).size === regions.length,
      "Each area can only be reported once",
    ),
});

export const intakeIdSchema = z.object({ id: z.uuid() });

export type SymptomQuality = z.infer<typeof symptomQualitySchema>;
export type TriageLevel = z.infer<typeof triageLevelSchema>;
export type Pin = z.infer<typeof pinSchema>;
export type IntakeRegionInput = z.input<typeof intakeRegionSchema>;
export type IntakeRegion = z.output<typeof intakeRegionSchema>;
export type CreateIntakeInput = z.input<typeof createIntakeSchema>;
