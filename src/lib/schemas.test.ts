import { describe, expect, it } from "vitest";
import { createIntakeSchema, intakeRegionSchema } from "./schemas";

const valid = { regionId: "chest", severity: 5, quality: "aching", durationDays: 3 };

describe("intakeRegionSchema", () => {
  it("fills defaults for optional fields", () => {
    expect(intakeRegionSchema.parse(valid)).toEqual({ ...valid, notes: "", pin: null });
  });

  it("trims notes", () => {
    expect(intakeRegionSchema.parse({ ...valid, notes: "  sore  " }).notes).toBe("sore");
  });

  it.each([
    ["unknown region", { regionId: "tail" }],
    ["severity above 10", { severity: 11 }],
    ["negative severity", { severity: -1 }],
    ["fractional severity", { severity: 4.5 }],
    ["unknown quality", { quality: "spicy" }],
    ["negative duration", { durationDays: -2 }],
    ["notes over 500 chars", { notes: "x".repeat(501) }],
    ["pin far outside the body", { pin: { x: 50, y: 1, z: 0 } }],
  ])("rejects %s", (_, patch) => {
    expect(intakeRegionSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe("createIntakeSchema", () => {
  it("accepts one or more distinct regions", () => {
    const parsed = createIntakeSchema.parse({
      regions: [valid, { ...valid, regionId: "left_hand" }],
    });
    expect(parsed.regions).toHaveLength(2);
  });

  it("requires at least one region", () => {
    expect(createIntakeSchema.safeParse({ regions: [] }).success).toBe(false);
  });

  it("rejects the same region twice", () => {
    expect(createIntakeSchema.safeParse({ regions: [valid, valid] }).success).toBe(false);
  });

  it("strips fields the client should not control, like a triage result", () => {
    const parsed = createIntakeSchema.parse({ regions: [valid], triage: { level: "routine" } });
    expect(parsed).not.toHaveProperty("triage");
  });
});
