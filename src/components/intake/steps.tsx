"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { SeverityBadge } from "@/components/severity-badge";
import { useTenant } from "@/components/tenant-context";
import { TriageBadge, TriageSummary } from "@/components/triage-summary";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { regionLabel, type RegionId } from "@/lib/regions";
import { DURATION_OPTIONS, QUALITY_LABELS } from "@/lib/schemas";
import { LEVEL_COPY, triage } from "@/lib/triage";
import { cn } from "@/lib/utils";
import { draftRegionsInOrder, useIntakeDraft, type DraftRegion } from "@/stores/intake-draft";
import { useTRPC } from "@/trpc/client";
import { RegionDetailsForm } from "./region-details-form";
import { RegionPicker } from "./region-picker";

function useDraftRegions() {
  const { order, regions } = useIntakeDraft(
    useShallow((s) => ({ order: s.order, regions: s.regions })),
  );
  return useMemo(() => draftRegionsInOrder({ order, regions }), [order, regions]);
}

function durationLabel(days: number) {
  return DURATION_OPTIONS.find((d) => d.days === days)?.label ?? `${days} days`;
}

function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <h2 data-step-heading tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
        {title}
      </h2>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function StepActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-auto flex gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:pb-0">
      {children}
    </div>
  );
}

export function SelectStep() {
  const order = useIntakeDraft((s) => s.order);
  const toggleRegion = useIntakeDraft((s) => s.toggleRegion);
  const goTo = useIntakeDraft((s) => s.goTo);
  const selected = useMemo(() => new Set(order), [order]);

  return (
    <>
      <StepHeading
        title="Where do you feel it?"
        hint="Tap the body, or pick from the list. Choose every area that's bothering you."
      />
      <RegionPicker selected={selected} onToggle={(id) => toggleRegion(id)} />
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {order.length === 0
          ? "No areas selected yet."
          : `${order.length} ${order.length === 1 ? "area" : "areas"} selected.`}
      </p>
      <StepActions>
        <Button
          size="lg"
          className="h-12 flex-1 text-base"
          disabled={order.length === 0}
          onClick={() => goTo("details")}
        >
          Continue <ArrowRightIcon aria-hidden="true" />
        </Button>
      </StepActions>
    </>
  );
}

function RegionSummaryLine({ region }: { region: DraftRegion }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <SeverityBadge severity={region.severity} />
      <span>{QUALITY_LABELS[region.quality]}</span>
      <span aria-hidden="true">·</span>
      <span>{durationLabel(region.durationDays)}</span>
    </span>
  );
}

export function DetailsStep() {
  const isDesktop = useIsDesktop();
  const regions = useDraftRegions();
  const { activeId, setActive, updateRegion, confirmRegion, removeRegion, goTo } = useIntakeDraft(
    useShallow((s) => ({
      activeId: s.activeId,
      setActive: s.setActive,
      updateRegion: s.updateRegion,
      confirmRegion: s.confirmRegion,
      removeRegion: s.removeRegion,
      goTo: s.goTo,
    })),
  );
  const active = regions.find((r) => r.regionId === activeId) ?? null;
  const remaining = regions.filter((r) => !r.confirmed).length;

  const form = (region: DraftRegion) => (
    <RegionDetailsForm
      region={region}
      onChange={(patch) => updateRegion(region.regionId, patch)}
      onDone={() => confirmRegion(region.regionId)}
      onRemove={() => removeRegion(region.regionId)}
    />
  );

  return (
    <>
      <StepHeading
        title="Tell us about each area"
        hint="Open each area to describe it. The body view follows along."
      />

      {regions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You removed every area. Go back to choose where you feel it.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {regions.map((region) => {
          const isActive = region.regionId === activeId;
          return (
            <li
              key={region.regionId}
              className={cn(
                "rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200",
                isActive && "border-brand shadow-[0_0_0_3px] shadow-brand-accent/25",
              )}
            >
              <button
                type="button"
                aria-expanded={isActive}
                onClick={() => setActive(isActive ? null : (region.regionId as RegionId))}
                className="flex w-full items-center justify-between gap-3 rounded-2xl p-3.5 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-center gap-2 font-medium">
                    {regionLabel(region.regionId)}
                    {region.confirmed ? (
                      <CheckCircle2Icon className="size-4 text-brand" aria-label="Details saved" />
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                        Needs details
                      </span>
                    )}
                  </span>
                  {region.confirmed ? <RegionSummaryLine region={region} /> : null}
                </span>
                <PencilIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
              {isDesktop && isActive ? <div className="border-t p-4">{form(region)}</div> : null}
            </li>
          );
        })}
      </ul>

      {!isDesktop ? (
        <Drawer
          showSwipeHandle
          open={active !== null}
          onOpenChange={(open) => {
            if (!open) setActive(null);
          }}
        >
          <DrawerContent className="max-h-[85dvh]">
            {active ? (
              <>
                <DrawerHeader className="text-left">
                  <DrawerTitle>{regionLabel(active.regionId)}</DrawerTitle>
                  <DrawerDescription>Describe what you&apos;re feeling here.</DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
                  {form(active)}
                </div>
              </>
            ) : null}
          </DrawerContent>
        </Drawer>
      ) : null}

      <StepActions>
        <Button variant="outline" size="lg" className="h-12" onClick={() => goTo("select")}>
          <ArrowLeftIcon aria-hidden="true" /> Back
        </Button>
        <Button
          size="lg"
          className="h-12 flex-1 text-base"
          disabled={regions.length === 0 || remaining > 0}
          onClick={() => goTo("review")}
        >
          {remaining > 0 ? `${remaining} left to describe` : "Review"}
          {remaining === 0 ? <ArrowRightIcon aria-hidden="true" /> : null}
        </Button>
      </StepActions>
    </>
  );
}

export function ReviewStep() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const regions = useDraftRegions();
  const goTo = useIntakeDraft((s) => s.goTo);
  const markSubmitted = useIntakeDraft((s) => s.markSubmitted);
  const preview = useMemo(() => triage(regions), [regions]);

  const submit = useMutation(
    trpc.intake.create.mutationOptions({
      onSuccess: async (result) => {
        markSubmitted({ id: result.id, level: result.triage.level });
        await queryClient.invalidateQueries({ queryKey: trpc.intake.list.queryKey() });
      },
    }),
  );

  return (
    <>
      <StepHeading
        title="Check and send"
        hint="This is exactly what your care team will see, and how it will be routed."
      />

      <div className="flex flex-col gap-5">
        <TriageSummary level={preview.level} reasons={preview.reasons} audience="patient" />

        <section aria-labelledby="review-areas-heading">
          <h3 id="review-areas-heading" className="mb-2 text-sm font-semibold">
            Your areas
          </h3>
          <ul className="divide-y rounded-2xl border bg-card">
            {regions.map((r) => (
              <li key={r.regionId} className="flex flex-col gap-1.5 p-3.5">
                <span className="font-medium">{regionLabel(r.regionId)}</span>
                <RegionSummaryLine region={r} />
                {r.notes ? <p className="text-sm text-muted-foreground">“{r.notes}”</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">
          The same rules run again on the clinic&apos;s server when you send, so what you see here is
          what gets recorded.
        </p>

        {submit.error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            We couldn&apos;t send your intake: {submit.error.message}. Please try again.
          </p>
        ) : null}
      </div>

      <StepActions>
        <Button
          variant="outline"
          size="lg"
          className="h-12"
          disabled={submit.isPending}
          onClick={() => goTo("details")}
        >
          <ArrowLeftIcon aria-hidden="true" /> Edit
        </Button>
        <Button
          size="lg"
          className="h-12 flex-1 text-base"
          disabled={submit.isPending}
          onClick={() =>
            submit.mutate({
              regions: regions.map(({ confirmed: _confirmed, ...r }) => r),
            })
          }
        >
          {submit.isPending ? "Sending…" : "Send to care team"}
        </Button>
      </StepActions>
    </>
  );
}

export function SubmittedStep() {
  const { slug } = useTenant();
  const submitted = useIntakeDraft((s) => s.submitted);
  const reset = useIntakeDraft((s) => s.reset);
  if (!submitted) return null;

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 data-step-heading tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
            Sent to your care team
          </h2>
          <p className="text-sm text-muted-foreground">
            Reference <span className="font-mono">{submitted.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
        <TriageBadge level={submitted.level} />
        <p className={cn("rounded-xl p-3 text-sm", submitted.level === "urgent" ? "bg-red-600 text-white" : "bg-muted")}>
          {LEVEL_COPY[submitted.level].nextSteps}
        </p>
      </div>

      <StepActions>
        <Button variant="outline" size="lg" className="h-12 flex-1" onClick={reset}>
          Start a new intake
        </Button>
        <Link
          href={`/t/${slug}/provider/${submitted.id}`}
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-medium text-white hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          See provider view <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </StepActions>
    </>
  );
}
