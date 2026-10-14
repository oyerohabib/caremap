CREATE TYPE "public"."audit_actor" AS ENUM('patient', 'system', 'provider');--> statement-breakpoint
CREATE TYPE "public"."intake_status" AS ENUM('submitted', 'reviewed');--> statement-breakpoint
CREATE TYPE "public"."triage_level" AS ENUM('routine', 'soon', 'urgent');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"intake_id" uuid,
	"actor" "audit_actor" NOT NULL,
	"action" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intake_id" uuid NOT NULL,
	"region_id" text NOT NULL,
	"severity" integer NOT NULL,
	"quality" text NOT NULL,
	"duration_days" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"pin_x" real,
	"pin_y" real,
	"pin_z" real
);
--> statement-breakpoint
CREATE TABLE "intakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"status" "intake_status" DEFAULT 'submitted' NOT NULL,
	"triage_level" "triage_level" NOT NULL,
	"triage_reasons" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"primary_color" text NOT NULL,
	"accent_color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_regions" ADD CONSTRAINT "intake_regions_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_intake_idx" ON "audit_events" USING btree ("intake_id","created_at");--> statement-breakpoint
CREATE INDEX "intake_regions_intake_idx" ON "intake_regions" USING btree ("intake_id");--> statement-breakpoint
CREATE INDEX "intakes_tenant_created_idx" ON "intakes" USING btree ("tenant_id","created_at");