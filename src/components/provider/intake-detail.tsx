"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  BotIcon,
  CheckIcon,
  RotateCcwIcon,
  StethoscopeIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BodyMap, type BodyMapPin, type BodyView } from "@/components/body-map";
import { SeverityBadge } from "@/components/severity-badge";
import { useTenant } from "@/components/tenant-context";
import { TriageBadge, TriageSummary } from "@/components/triage-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, shortRef, timeAgo } from "@/lib/format";
import { REGIONS, regionLabel, type RegionId } from "@/lib/regions";
import { DURATION_OPTIONS, QUALITY_LABELS, type SymptomQuality } from "@/lib/schemas";
import { LEVEL_COPY } from "@/lib/triage";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";
import { useTRPC } from "@/trpc/client";

type Detail = RouterOutputs["intake"]["byId"];
type AuditEvent = Detail["auditEvents"][number];

const ACTOR_ICON = { patient: UserIcon, system: BotIcon, provider: StethoscopeIcon } as const;

function durationLabel(days: number) {
  return DURATION_OPTIONS.find((d) => d.days === days)?.label ?? `${days} days`;
}

function describeEvent(event: AuditEvent): string {
  const detail = event.detail as Record<string, unknown>;
  switch (event.action) {
    case "intake.submitted": {
      const count = Number(detail.regionCount ?? 0);
      return `Submitted intake (${count} ${count === 1 ? "area" : "areas"})`;
    }
    case "intake.triaged": {
      const level = detail.level as keyof typeof LEVEL_COPY | undefined;
      const rules = Array.isArray(detail.rules) ? detail.rules.join(", ") : "";
      return `Triaged as ${level ? LEVEL_COPY[level].label : "unknown"}${rules ? ` (rules: ${rules})` : ""}`;
    }
    case "intake.reviewed":
      return `${String(detail.reviewer ?? "Clinician")} marked reviewed`;
    default:
      return event.action;
  }
}

function AuditTrail({ events }: { events: AuditEvent[] }) {
  return (
    <section aria-labelledby="audit-heading" className="flex flex-col gap-3">
      <h2 id="audit-heading" className="text-sm font-semibold">
        Audit trail
      </h2>
      <ol className="relative flex flex-col gap-4 border-l pl-5">
        {events.map((event) => {
          const Icon = ACTOR_ICON[event.actor];
          return (
            <li key={event.id} className="relative">
              <span className="absolute top-0.5 -left-[31px] grid size-5 place-items-center rounded-full border bg-background">
                <Icon className="size-3 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="text-sm">
                <span className="font-medium capitalize">{event.actor}</span>
                <span className="text-muted-foreground"> · {describeEvent(event)}</span>
              </p>
              <time className="text-xs text-muted-foreground" dateTime={event.createdAt.toISOString()}>
                {formatDateTime(event.createdAt)}
              </time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function IntakeDetail({ id }: { id: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { slug } = useTenant();
  const { data, isPending, error } = useQuery(trpc.intake.byId.queryOptions({ id }));
  const [focused, setFocused] = useState<RegionId | null>(null);
  const [viewOverride, setViewOverride] = useState<BodyView | null>(null);

  const markReviewed = useMutation(
    trpc.intake.markReviewed.mutationOptions({
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: trpc.intake.byId.queryKey({ id }) }),
          queryClient.invalidateQueries({ queryKey: trpc.intake.list.queryKey() }),
        ]),
    }),
  );

  const regions = useMemo(() => data?.regions ?? [], [data]);
  const pins = useMemo<BodyMapPin[]>(
    () =>
      regions.map((r) => ({
        id: r.id,
        regionId: r.regionId as RegionId,
        position: r.pinX != null && r.pinY != null && r.pinZ != null ? [r.pinX, r.pinY, r.pinZ] : null,
        severity: r.severity,
      })),
    [regions],
  );

  if (isPending) {
    return (
      <div className="grid flex-1 gap-4 p-4 md:grid-cols-2 md:p-6">
        <Skeleton className="h-[50dvh] rounded-2xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-start gap-3 p-6">
        <p role="alert" className="text-sm text-destructive">
          {error.data?.code === "NOT_FOUND" ? "This intake doesn't exist for this clinic." : error.message}
        </p>
        <Link href={`/t/${slug}/provider`} className="text-sm font-medium underline underline-offset-4">
          Back to inbox
        </Link>
      </div>
    );
  }

  const selectedIds = regions.map((r) => r.regionId as RegionId);
  const mostSevere = selectedIds[0];
  const defaultView: BodyView = mostSevere && REGIONS[mostSevere]?.facing === "back" ? "back" : "front";
  const view = viewOverride ?? defaultView;
  const reviewed = data.status === "reviewed";

  return (
    <div className="flex flex-1 flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(400px,520px)]">
      <section
        aria-label="Body map"
        className="relative h-[44dvh] min-h-[280px] shrink-0 bg-gradient-to-b from-white to-stone-100 md:sticky md:top-[5.25rem] md:h-[calc(100dvh-5.25rem)]"
      >
        <BodyMap
          selectedIds={selectedIds}
          activeId={focused}
          pins={pins}
          view={view}
          interactive={false}
          orbit
          ariaLabel={`3D body map for intake ${shortRef(data.id)}. Reported: ${selectedIds
            .map((rid) => regionLabel(rid).toLowerCase())
            .join(", ")}.`}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Link
            href={`/t/${slug}/provider`}
            className="pointer-events-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-background/90 px-3 text-xs font-medium shadow-xs backdrop-blur focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden="true" /> Inbox
          </Link>
          <div
            role="group"
            aria-label="Body view"
            className="pointer-events-auto flex rounded-full bg-background/90 p-0.5 text-xs font-medium shadow-xs backdrop-blur"
          >
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => {
                  setFocused(null);
                  setViewOverride(v);
                }}
                className={cn(
                  "min-h-9 rounded-full px-3 capitalize transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  view === v ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {focused ? (
          <button
            type="button"
            onClick={() => setFocused(null)}
            className="absolute bottom-3 left-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-background/90 px-3 text-xs font-medium shadow-xs backdrop-blur focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <RotateCcwIcon className="size-3.5" aria-hidden="true" /> Whole body
          </button>
        ) : null}
      </section>

      <div className="flex flex-col gap-6 border-t bg-background px-4 py-5 pb-[max(env(safe-area-inset-bottom),2rem)] md:border-t-0 md:border-l md:px-6 md:py-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TriageBadge level={data.triageLevel} />
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                reviewed ? "bg-muted text-muted-foreground" : "bg-brand/10 text-brand",
              )}
            >
              {reviewed ? "Reviewed" : "Needs review"}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Intake <span className="font-mono">#{shortRef(data.id)}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Submitted <time dateTime={data.createdAt.toISOString()}>{timeAgo(data.createdAt)}</time> ·{" "}
            {formatDateTime(data.createdAt)}
          </p>
        </header>

        <TriageSummary level={data.triageLevel} reasons={data.triageReasons} audience="provider" />

        <section aria-labelledby="regions-heading" className="flex flex-col gap-2">
          <h2 id="regions-heading" className="text-sm font-semibold">
            Reported areas
          </h2>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Areas reported by the patient, most severe first</caption>
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Area</th>
                  <th scope="col" className="px-3 py-2 font-medium">Severity</th>
                  <th scope="col" className="px-3 py-2 font-medium">Feels</th>
                  <th scope="col" className="px-3 py-2 font-medium">For</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {regions.map((r) => {
                  const rid = r.regionId as RegionId;
                  const isFocused = focused === rid;
                  return (
                    <tr key={r.id} className={cn(isFocused && "bg-brand/5")}>
                      <th scope="row" className="px-3 py-2.5 align-top font-medium">
                        <button
                          type="button"
                          aria-pressed={isFocused}
                          onClick={() => setFocused(isFocused ? null : rid)}
                          className="rounded text-left underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {regionLabel(rid)}
                        </button>
                        {r.notes ? (
                          <p className="mt-1 text-xs font-normal text-muted-foreground">“{r.notes}”</p>
                        ) : null}
                      </th>
                      <td className="px-3 py-2.5 align-top">
                        <SeverityBadge severity={r.severity} />
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        {QUALITY_LABELS[r.quality as SymptomQuality] ?? r.quality}
                      </td>
                      <td className="px-3 py-2.5 align-top whitespace-nowrap">{durationLabel(r.durationDays)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Select an area to focus it on the map.</p>
        </section>

        <AuditTrail events={data.auditEvents} />

        <div className="sticky bottom-0 -mx-4 mt-auto border-t bg-background/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:pb-0">
          {markReviewed.error ? (
            <p role="alert" className="mb-2 text-sm text-destructive">
              {markReviewed.error.message}
            </p>
          ) : null}
          <Button
            size="lg"
            className="h-12 w-full text-base"
            disabled={reviewed || markReviewed.isPending}
            onClick={() => markReviewed.mutate({ id: data.id })}
          >
            {reviewed ? (
              <>
                <CheckIcon aria-hidden="true" /> Reviewed{" "}
                {data.reviewedAt ? timeAgo(data.reviewedAt) : ""}
              </>
            ) : markReviewed.isPending ? (
              "Saving…"
            ) : (
              "Mark reviewed"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
