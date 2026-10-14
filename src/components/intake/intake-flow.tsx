"use client";

import { RotateCcwIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { BodyMap, type BodyMapPin } from "@/components/body-map";
import type { Vec3 } from "@/components/body-map/regions";
import { useTenant } from "@/components/tenant-context";
import { regionLabel, type RegionId } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { draftRegionsInOrder, useIntakeDraft } from "@/stores/intake-draft";
import { Stepper } from "./stepper";
import { DetailsStep, ReviewStep, SelectStep, SubmittedStep } from "./steps";

const STEP_TRANSITION = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const;

export function IntakeFlow() {
  const { slug } = useTenant();
  const { step, view, activeId, order, regions } = useIntakeDraft(
    useShallow((s) => ({
      step: s.step,
      view: s.view,
      activeId: s.activeId,
      order: s.order,
      regions: s.regions,
    })),
  );
  const { startFor, toggleRegion, setActive, setView } = useIntakeDraft(
    useShallow((s) => ({
      startFor: s.startFor,
      toggleRegion: s.toggleRegion,
      setActive: s.setActive,
      setView: s.setView,
    })),
  );

  useEffect(() => startFor(slug), [slug, startFor]);

  const panel = useRef<HTMLElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const id = window.setTimeout(() => {
      panel.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    }, 260);
    return () => window.clearTimeout(id);
  }, [step]);

  const draft = useMemo(() => draftRegionsInOrder({ order, regions }), [order, regions]);
  const pins = useMemo<BodyMapPin[]>(
    () =>
      draft.map((r) => ({
        id: r.regionId,
        regionId: r.regionId,
        position: r.pin ? [r.pin.x, r.pin.y, r.pin.z] : null,
        severity: r.severity,
      })),
    [draft],
  );

  const editing = step === "select" || step === "details";
  const showActive = step === "details";

  const handleRegionTap = (id: RegionId, point: Vec3) => {
    if (step === "details" && regions[id]) setActive(id);
    else toggleRegion(id, point);
  };

  const ariaLabel =
    order.length === 0
      ? "3D body map. No areas selected yet. Use the list of body areas to choose without the map."
      : `3D body map. Selected: ${order.map((id) => regionLabel(id).toLowerCase()).join(", ")}.`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-1 flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(380px,440px)]">
        <section
          aria-label="Body map"
          className="relative h-[46dvh] min-h-[300px] shrink-0 bg-gradient-to-b from-white to-stone-100 md:sticky md:top-[5.25rem] md:h-[calc(100dvh-5.25rem)]"
        >
          <BodyMap
            selectedIds={order}
            activeId={showActive ? activeId : null}
            pins={pins}
            view={view}
            interactive={editing}
            onRegionTap={handleRegionTap}
            ariaLabel={ariaLabel}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <p className="max-w-[60%] rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-xs backdrop-blur">
              {editing ? "Tap an area · drag to turn" : "Your areas"}
            </p>
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
                  onClick={() => setView(v)}
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
          {showActive && activeId ? (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute bottom-3 left-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-background/90 px-3 text-xs font-medium shadow-xs backdrop-blur focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <RotateCcwIcon className="size-3.5" aria-hidden="true" /> Whole body
            </button>
          ) : null}
        </section>

        <section
          ref={panel}
          aria-label="Intake steps"
          className="flex flex-1 flex-col gap-5 border-t bg-background px-4 pt-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] md:border-t-0 md:border-l md:px-6 md:pt-6"
        >
          <Stepper step={step} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={STEP_TRANSITION}
              className="flex flex-1 flex-col"
            >
              {step === "select" ? <SelectStep /> : null}
              {step === "details" ? <DetailsStep /> : null}
              {step === "review" ? <ReviewStep /> : null}
              {step === "submitted" ? <SubmittedStep /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </MotionConfig>
  );
}
