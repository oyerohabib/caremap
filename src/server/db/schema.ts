import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { AUDIT_ACTORS, INTAKE_STATUSES, TRIAGE_LEVELS } from "@/lib/schemas";
import type { TriageReason } from "@/lib/triage";

export const intakeStatus = pgEnum("intake_status", INTAKE_STATUSES);
export const triageLevel = pgEnum("triage_level", TRIAGE_LEVELS);
export const auditActor = pgEnum("audit_actor", AUDIT_ACTORS);

export const tenants = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  primaryColor: text().notNull(),
  accentColor: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const intakes = pgTable(
  "intakes",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    status: intakeStatus().notNull().default("submitted"),
    triageLevel: triageLevel().notNull(),
    triageReasons: jsonb().$type<TriageReason[]>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index("intakes_tenant_created_idx").on(t.tenantId, t.createdAt)],
);

export const intakeRegions = pgTable(
  "intake_regions",
  {
    id: uuid().primaryKey().defaultRandom(),
    intakeId: uuid()
      .notNull()
      .references(() => intakes.id, { onDelete: "cascade" }),
    regionId: text().notNull(),
    severity: integer().notNull(),
    quality: text().notNull(),
    durationDays: integer().notNull(),
    notes: text().notNull().default(""),
    pinX: real(),
    pinY: real(),
    pinZ: real(),
  },
  (t) => [index("intake_regions_intake_idx").on(t.intakeId)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    intakeId: uuid().references(() => intakes.id, { onDelete: "cascade" }),
    actor: auditActor().notNull(),
    action: text().notNull(),
    detail: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_events_intake_idx").on(t.intakeId, t.createdAt)],
);

export type Tenant = typeof tenants.$inferSelect;
export type Intake = typeof intakes.$inferSelect;
export type IntakeRegionRow = typeof intakeRegions.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
