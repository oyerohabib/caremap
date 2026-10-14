import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { createIntakeSchema, intakeIdSchema } from "@/lib/schemas";
import { triage } from "@/lib/triage";
import { auditEvents, intakeRegions, intakes } from "@/server/db/schema";
import { createTRPCRouter, tenantProcedure } from "../trpc";

const levelOrder = sql`case ${intakes.triageLevel} when 'urgent' then 0 when 'soon' then 1 else 2 end`;

export const intakeRouter = createTRPCRouter({
  create: tenantProcedure.input(createIntakeSchema).mutation(async ({ ctx, input }) => {
    // Recomputed here: the client's preview is never trusted.
    const result = triage(input.regions);

    return ctx.db.transaction(async (tx) => {
      const [intake] = await tx
        .insert(intakes)
        .values({
          tenantId: ctx.tenant.id,
          triageLevel: result.level,
          triageReasons: result.reasons,
        })
        .returning({ id: intakes.id, createdAt: intakes.createdAt });

      await tx.insert(intakeRegions).values(
        input.regions.map((r) => ({
          intakeId: intake.id,
          regionId: r.regionId,
          severity: r.severity,
          quality: r.quality,
          durationDays: r.durationDays,
          notes: r.notes,
          pinX: r.pin?.x ?? null,
          pinY: r.pin?.y ?? null,
          pinZ: r.pin?.z ?? null,
        })),
      );

      await tx.insert(auditEvents).values([
        {
          tenantId: ctx.tenant.id,
          intakeId: intake.id,
          actor: "patient",
          action: "intake.submitted",
          detail: { regionCount: input.regions.length },
        },
        {
          tenantId: ctx.tenant.id,
          intakeId: intake.id,
          actor: "system",
          action: "intake.triaged",
          detail: { level: result.level, rules: result.reasons.map((r) => r.rule) },
        },
      ]);

      return { id: intake.id, createdAt: intake.createdAt, triage: result };
    });
  }),

  list: tenantProcedure.query(({ ctx }) =>
    ctx.db
      .select({
        ...getTableColumns(intakes),
        regionCount: sql<number>`(select count(*) from intake_regions r where r.intake_id = "intakes"."id")`.mapWith(Number),
        maxSeverity: sql<number>`(select coalesce(max(r.severity), 0) from intake_regions r where r.intake_id = "intakes"."id")`.mapWith(Number),
        regionIds: sql<string[]>`(select coalesce(array_agg(r.region_id order by r.severity desc), '{}') from intake_regions r where r.intake_id = "intakes"."id")`,
      })
      .from(intakes)
      .where(eq(intakes.tenantId, ctx.tenant.id))
      .orderBy(asc(intakes.status), levelOrder, desc(intakes.createdAt)),
  ),

  byId: tenantProcedure.input(intakeIdSchema).query(async ({ ctx, input }) => {
    const [intake] = await ctx.db
      .select()
      .from(intakes)
      .where(and(eq(intakes.id, input.id), eq(intakes.tenantId, ctx.tenant.id)))
      .limit(1);
    if (!intake) throw new TRPCError({ code: "NOT_FOUND", message: "Intake not found" });

    const [regions, events] = await Promise.all([
      ctx.db
        .select()
        .from(intakeRegions)
        .where(eq(intakeRegions.intakeId, intake.id))
        .orderBy(desc(intakeRegions.severity)),
      ctx.db
        .select()
        .from(auditEvents)
        .where(and(eq(auditEvents.intakeId, intake.id), eq(auditEvents.tenantId, ctx.tenant.id)))
        .orderBy(asc(auditEvents.createdAt), asc(auditEvents.actor)),
    ]);

    return { ...intake, regions, auditEvents: events };
  }),

  markReviewed: tenantProcedure.input(intakeIdSchema).mutation(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(intakes)
        .set({ status: "reviewed", reviewedAt: new Date() })
        .where(
          and(
            eq(intakes.id, input.id),
            eq(intakes.tenantId, ctx.tenant.id),
            eq(intakes.status, "submitted"),
          ),
        )
        .returning({ id: intakes.id, reviewedAt: intakes.reviewedAt });

      if (!updated) {
        const [existing] = await tx
          .select({ id: intakes.id })
          .from(intakes)
          .where(and(eq(intakes.id, input.id), eq(intakes.tenantId, ctx.tenant.id)))
          .limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Intake not found" });
        throw new TRPCError({ code: "CONFLICT", message: "Intake already reviewed" });
      }

      await tx.insert(auditEvents).values({
        tenantId: ctx.tenant.id,
        intakeId: updated.id,
        actor: "provider",
        action: "intake.reviewed",
        detail: { reviewer: "Demo clinician" },
      });

      return updated;
    }),
  ),
});
