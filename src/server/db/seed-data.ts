import { eq } from "drizzle-orm";
import { REGION_GEOMETRY } from "@/components/body-map/regions";
import type { RegionId } from "@/lib/regions";
import type { IntakeRegion, SymptomQuality } from "@/lib/schemas";
import { DEMO_TENANTS } from "@/lib/tenants";
import { triage } from "@/lib/triage";
import type { Db } from "./index";
import { auditEvents, intakeRegions, intakes, tenants } from "./schema";

type SampleRegion = [RegionId, number, SymptomQuality, number, string?];

interface SampleIntake {
  hoursAgo: number;
  reviewed?: boolean;
  regions: SampleRegion[];
}

const SAMPLES: Record<string, SampleIntake[]> = {
  lumen: [
    { hoursAgo: 0.5, regions: [["chest", 8, "sharp", 0, "Worse when breathing in"]] },
    { hoursAgo: 2, regions: [["head", 9, "throbbing", 0, "Came on suddenly"]] },
    { hoursAgo: 5, regions: [["abdomen", 5, "aching", 1], ["lower_back", 4, "aching", 1]] },
    { hoursAgo: 9, regions: [["neck", 3, "stiffness", 3]] },
    {
      hoursAgo: 20,
      regions: [["left_hand", 4, "tingling", 21, "Mostly at night"], ["left_forearm", 3, "tingling", 21]],
    },
    { hoursAgo: 30, reviewed: true, regions: [["right_foot", 6, "sharp", 7]] },
    {
      hoursAgo: 52,
      reviewed: true,
      regions: [["head", 4, "aching", 3], ["neck", 4, "stiffness", 3], ["upper_back", 3, "aching", 3]],
    },
    { hoursAgo: 75, reviewed: true, regions: [["pelvis", 2, "aching", 14]] },
  ],
  northwind: [
    { hoursAgo: 1, regions: [["lower_back", 8, "sharp", 0, "Lifting a box"]] },
    { hoursAgo: 3, regions: [["right_shin", 6, "aching", 60, "Runner, worse after long runs"]] },
    {
      hoursAgo: 6,
      regions: [["left_thigh", 5, "aching", 3], ["left_shin", 4, "aching", 3], ["left_foot", 3, "stiffness", 3]],
    },
    { hoursAgo: 12, regions: [["right_upper_arm", 4, "aching", 7]] },
    { hoursAgo: 26, regions: [["upper_back", 3, "stiffness", 21]] },
    { hoursAgo: 40, reviewed: true, regions: [["neck", 5, "stiffness", 1]] },
    { hoursAgo: 60, reviewed: true, regions: [["right_hand", 2, "tingling", 3]] },
    { hoursAgo: 90, reviewed: true, regions: [["left_forearm", 3, "burning", 7]] },
  ],
};

function toRegion([regionId, severity, quality, durationDays, notes = ""]: SampleRegion): IntakeRegion {
  const [x, y, z] = REGION_GEOMETRY[regionId].anchor;
  return { regionId, severity, quality, durationDays, notes, pin: { x, y, z } };
}

export async function seedDemoData(db: Db, now = new Date()): Promise<void> {
  for (const brand of DEMO_TENANTS) {
    const [tenant] = await db
      .insert(tenants)
      .values({
        slug: brand.slug,
        name: brand.name,
        primaryColor: brand.primaryColor,
        accentColor: brand.accentColor,
      })
      .onConflictDoUpdate({
        target: tenants.slug,
        set: { name: brand.name, primaryColor: brand.primaryColor, accentColor: brand.accentColor },
      })
      .returning();

    await db.delete(intakes).where(eq(intakes.tenantId, tenant.id));

    for (const sample of SAMPLES[brand.slug] ?? []) {
      const regions = sample.regions.map(toRegion);
      const result = triage(regions);
      const createdAt = new Date(now.getTime() - sample.hoursAgo * 3_600_000);
      const reviewedAt = sample.reviewed ? new Date(createdAt.getTime() + 3_600_000) : null;

      const [intake] = await db
        .insert(intakes)
        .values({
          tenantId: tenant.id,
          status: sample.reviewed ? "reviewed" : "submitted",
          triageLevel: result.level,
          triageReasons: result.reasons,
          createdAt,
          reviewedAt,
        })
        .returning({ id: intakes.id });

      await db.insert(intakeRegions).values(
        regions.map((r) => ({
          intakeId: intake.id,
          regionId: r.regionId,
          severity: r.severity,
          quality: r.quality,
          durationDays: r.durationDays,
          notes: r.notes,
          pinX: r.pin?.x,
          pinY: r.pin?.y,
          pinZ: r.pin?.z,
        })),
      );

      await db.insert(auditEvents).values([
        {
          tenantId: tenant.id,
          intakeId: intake.id,
          actor: "patient",
          action: "intake.submitted",
          detail: { regionCount: regions.length },
          createdAt,
        },
        {
          tenantId: tenant.id,
          intakeId: intake.id,
          actor: "system",
          action: "intake.triaged",
          detail: { level: result.level, rules: result.reasons.map((r) => r.rule) },
          createdAt,
        },
        ...(reviewedAt
          ? [
              {
                tenantId: tenant.id,
                intakeId: intake.id,
                actor: "provider" as const,
                action: "intake.reviewed",
                detail: { reviewer: "Demo clinician" },
                createdAt: reviewedAt,
              },
            ]
          : []),
      ]);
    }
  }
}
