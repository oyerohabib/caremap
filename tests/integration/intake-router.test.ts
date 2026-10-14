import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import type { CreateIntakeInput } from "@/lib/schemas";
import { createCaller } from "@/server/api/root";
import { createDb, type Db } from "@/server/db";
import { auditEvents, intakes } from "@/server/db/schema";

let db: Db;
const callerFor = (tenantSlug: string | null) => createCaller({ db, tenantSlug });

const chestPain: CreateIntakeInput = {
  regions: [
    { regionId: "chest", severity: 8, quality: "sharp", durationDays: 0, notes: "test" },
    { regionId: "left_forearm", severity: 2, quality: "aching", durationDays: 1 },
  ],
};

async function expectTrpcError(promise: Promise<unknown>, code: TRPCError["code"]) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe(code);
}

beforeAll(async () => {
  db = await createDb("pglite://memory");
});

describe("tenant resolution", () => {
  it("rejects tenant-scoped calls without a tenant", async () => {
    await expectTrpcError(callerFor(null).intake.list(), "BAD_REQUEST");
  });

  it("rejects unknown tenants", async () => {
    await expectTrpcError(callerFor("nope").intake.list(), "NOT_FOUND");
  });

  it("returns brand colours by slug", async () => {
    const tenant = await callerFor(null).tenant.bySlug({ slug: "lumen" });
    expect(tenant).toMatchObject({ name: "Lumen Health", primaryColor: "#0f766e" });
  });

  it("answers the health check from the database", async () => {
    const health = await callerFor(null).health.ping();
    expect(health).toMatchObject({ ok: true, tenants: 2 });
  });
});

describe("intake.create", () => {
  it("recomputes triage on the server and ignores client-supplied results", async () => {
    const tampered = { ...chestPain, triage: { level: "routine" } } as CreateIntakeInput;
    const created = await callerFor("lumen").intake.create(tampered);

    expect(created.triage.level).toBe("urgent");
    expect(created.triage.reasons.map((r) => r.rule)).toContain("chest-high-severity");

    const [row] = await db.select().from(intakes).where(eq(intakes.id, created.id));
    expect(row.triageLevel).toBe("urgent");
    expect(row.status).toBe("submitted");
  });

  it("writes the intake, its regions and two audit events together", async () => {
    const created = await callerFor("lumen").intake.create(chestPain);
    const detail = await callerFor("lumen").intake.byId({ id: created.id });

    expect(detail.regions).toHaveLength(2);
    expect(detail.regions[0]).toMatchObject({ regionId: "chest", severity: 8, notes: "test" });
    expect(detail.auditEvents.map((e) => `${e.actor}:${e.action}`)).toEqual([
      "patient:intake.submitted",
      "system:intake.triaged",
    ]);
  });

  it("rejects invalid input before touching the database", async () => {
    const before = await db.$count(intakes);
    await expectTrpcError(
      callerFor("lumen").intake.create({
        regions: [{ regionId: "chest", severity: 11, quality: "sharp", durationDays: 0 }],
      }),
      "BAD_REQUEST",
    );
    await expectTrpcError(callerFor("lumen").intake.create({ regions: [] }), "BAD_REQUEST");
    expect(await db.$count(intakes)).toBe(before);
  });
});

describe("tenant isolation", () => {
  it("never lists another tenant's intakes", async () => {
    const created = await callerFor("northwind").intake.create(chestPain);
    const lumenList = await callerFor("lumen").intake.list();
    const northwindList = await callerFor("northwind").intake.list();

    expect(lumenList.some((i) => i.id === created.id)).toBe(false);
    expect(northwindList.some((i) => i.id === created.id)).toBe(true);
  });

  it("cannot read or review another tenant's intake by id", async () => {
    const created = await callerFor("northwind").intake.create(chestPain);

    await expectTrpcError(callerFor("lumen").intake.byId({ id: created.id }), "NOT_FOUND");
    await expectTrpcError(callerFor("lumen").intake.markReviewed({ id: created.id }), "NOT_FOUND");

    const [row] = await db.select().from(intakes).where(eq(intakes.id, created.id));
    expect(row.status).toBe("submitted");
  });
});

describe("intake.list", () => {
  it("puts open urgent intakes first and reviewed ones last", async () => {
    const list = await callerFor("lumen").intake.list();
    const firstReviewed = list.findIndex((i) => i.status === "reviewed");
    const lastSubmitted = list.findLastIndex((i) => i.status === "submitted");

    expect(list[0]).toMatchObject({ status: "submitted", triageLevel: "urgent" });
    expect(firstReviewed).toBeGreaterThan(lastSubmitted);
    expect(list[0].regionCount).toBeGreaterThan(0);
  });
});

describe("intake.markReviewed", () => {
  it("marks the intake reviewed and appends a provider audit event", async () => {
    const created = await callerFor("lumen").intake.create(chestPain);
    const reviewed = await callerFor("lumen").intake.markReviewed({ id: created.id });
    expect(reviewed.reviewedAt).toBeInstanceOf(Date);

    const events = await db.select().from(auditEvents).where(eq(auditEvents.intakeId, created.id));
    expect(events.map((e) => e.actor)).toContain("provider");
  });

  it("refuses to review the same intake twice", async () => {
    const created = await callerFor("lumen").intake.create(chestPain);
    await callerFor("lumen").intake.markReviewed({ id: created.id });
    await expectTrpcError(callerFor("lumen").intake.markReviewed({ id: created.id }), "CONFLICT");
  });
});
