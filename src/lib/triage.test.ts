import { describe, expect, it } from "vitest";
import type { RegionId } from "./regions";
import { triage, type TriageRegion } from "./triage";

const r = (regionId: RegionId, severity: number, durationDays = 1): TriageRegion => ({
  regionId,
  severity,
  durationDays,
});

const cases: {
  name: string;
  regions: TriageRegion[];
  level: "routine" | "soon" | "urgent";
  rules: string[];
}[] = [
  { name: "single mild ache", regions: [r("left_forearm", 2)], level: "routine", rules: ["no-red-flags"] },
  { name: "moderate back pain for a week", regions: [r("lower_back", 6, 7)], level: "routine", rules: ["no-red-flags"] },
  { name: "chest pain at the threshold (7)", regions: [r("chest", 7)], level: "urgent", rules: ["chest-high-severity"] },
  { name: "chest pain just below the threshold (6)", regions: [r("chest", 6)], level: "routine", rules: ["no-red-flags"] },
  { name: "severe chest pain also counts as severe pain", regions: [r("chest", 9, 0)], level: "urgent", rules: ["chest-high-severity", "high-severity"] },
  { name: "sudden severe headache", regions: [r("head", 8, 0)], level: "urgent", rules: ["sudden-severe-headache", "high-severity"] },
  { name: "severe headache for a day is not sudden", regions: [r("head", 8, 1)], level: "soon", rules: ["high-severity"] },
  { name: "moderate headache today", regions: [r("head", 7, 0)], level: "routine", rules: ["no-red-flags"] },
  { name: "symptoms for exactly two weeks", regions: [r("neck", 3, 14)], level: "routine", rules: ["no-red-flags"] },
  { name: "symptoms for three weeks", regions: [r("neck", 3, 21)], level: "soon", rules: ["persistent-symptoms"] },
  { name: "two areas is fine", regions: [r("left_thigh", 3), r("left_shin", 3)], level: "routine", rules: ["no-red-flags"] },
  { name: "three areas at once", regions: [r("left_thigh", 3), r("left_shin", 3), r("left_foot", 3)], level: "soon", rules: ["multiple-regions"] },
  { name: "severe pain away from the chest or head", regions: [r("right_foot", 8, 3)], level: "soon", rules: ["high-severity"] },
  { name: "severe back pain does not trigger the chest rule", regions: [r("upper_back", 9)], level: "soon", rules: ["high-severity"] },
  {
    name: "urgent rule outranks several soon rules",
    regions: [r("chest", 8, 30), r("abdomen", 4, 30), r("neck", 2)],
    level: "urgent",
    rules: ["chest-high-severity", "high-severity", "persistent-symptoms", "multiple-regions"],
  },
  { name: "zero severity is still recorded as routine", regions: [r("pelvis", 0)], level: "routine", rules: ["no-red-flags"] },
];

describe("triage", () => {
  it.each(cases)("$name → $level", ({ regions, level, rules }) => {
    const result = triage(regions);
    expect(result.level).toBe(level);
    expect(result.reasons.map((reason) => reason.rule)).toEqual(rules);
  });

  it("orders reasons from most to least urgent", () => {
    const { reasons } = triage([r("neck", 2, 30), r("chest", 9)]);
    expect(reasons[0].level).toBe("urgent");
    expect(reasons.at(-1)?.level).toBe("soon");
  });

  it("explains which areas triggered a rule in plain language", () => {
    const { reasons } = triage([r("left_hand", 4, 21), r("right_foot", 2, 30)]);
    expect(reasons[0].message).toContain("left hand");
    expect(reasons[0].message).toContain("right foot");
  });

  it("is pure: the same input always gives the same output", () => {
    const input = [r("chest", 7), r("head", 9, 0)];
    expect(triage(input)).toEqual(triage([...input]));
  });
});
