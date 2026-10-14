import { regionLabel, type RegionId } from "./regions";
import type { TriageLevel } from "./schemas";

export interface TriageRegion {
  regionId: RegionId;
  severity: number;
  durationDays: number;
}

export interface TriageReason {
  rule: string;
  level: TriageLevel;
  message: string;
}

export interface TriageResult {
  level: TriageLevel;
  reasons: TriageReason[];
}

export const LEVEL_RANK: Record<TriageLevel, number> = {
  routine: 0,
  soon: 1,
  urgent: 2,
};

interface Rule {
  id: string;
  level: TriageLevel;
  evaluate: (regions: TriageRegion[]) => string | null;
}

const RULES: Rule[] = [
  {
    id: "chest-high-severity",
    level: "urgent",
    evaluate: (regions) => {
      const chest = regions.find((r) => r.regionId === "chest" && r.severity >= 7);
      return chest
        ? `High-severity chest pain (${chest.severity}/10): seek emergency care now.`
        : null;
    },
  },
  {
    id: "sudden-severe-headache",
    level: "urgent",
    evaluate: (regions) => {
      const head = regions.find(
        (r) => r.regionId === "head" && r.severity >= 8 && r.durationDays < 1,
      );
      return head
        ? `Sudden, severe head pain (${head.severity}/10, started today) needs urgent assessment.`
        : null;
    },
  },
  {
    id: "high-severity",
    level: "soon",
    evaluate: (regions) => {
      const severe = regions.filter((r) => r.severity >= 8);
      if (severe.length === 0) return null;
      const names = severe.map((r) => regionLabel(r.regionId).toLowerCase()).join(", ");
      return `Severe pain (8+/10) reported in: ${names}.`;
    },
  },
  {
    id: "persistent-symptoms",
    level: "soon",
    evaluate: (regions) => {
      const persistent = regions.filter((r) => r.durationDays > 14);
      if (persistent.length === 0) return null;
      const names = persistent.map((r) => regionLabel(r.regionId).toLowerCase()).join(", ");
      return `Symptoms lasting more than two weeks in: ${names}.`;
    },
  },
  {
    id: "multiple-regions",
    level: "soon",
    evaluate: (regions) =>
      regions.length >= 3
        ? `Symptoms in ${regions.length} areas at once are worth a clinician's look soon.`
        : null,
  },
];

export const RULE_IDS = RULES.map((r) => r.id);

export const LEVEL_COPY: Record<TriageLevel, { label: string; nextSteps: string }> = {
  urgent: {
    label: "Urgent",
    nextSteps:
      "Do not wait for an online visit. Call your local emergency number or go to the nearest emergency department now.",
  },
  soon: {
    label: "See a clinician soon",
    nextSteps:
      "A clinician will review your intake and reach out within 24 hours to book a video visit.",
  },
  routine: {
    label: "Routine",
    nextSteps:
      "A clinician will review your intake within 2–3 business days. Book a visit sooner if anything changes.",
  },
};

/**
 * Rules-based triage. Pure and deterministic so the client can preview the
 * result and the server can recompute it authoritatively from the same input.
 */
export function triage(regions: readonly TriageRegion[]): TriageResult {
  const list = [...regions];
  const reasons: TriageReason[] = [];

  for (const rule of RULES) {
    const message = rule.evaluate(list);
    if (message) reasons.push({ rule: rule.id, level: rule.level, message });
  }

  if (reasons.length === 0) {
    return {
      level: "routine",
      reasons: [
        {
          rule: "no-red-flags",
          level: "routine",
          message: "No red-flag patterns detected in what you reported.",
        },
      ],
    };
  }

  reasons.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]);
  return { level: reasons[0].level, reasons };
}
