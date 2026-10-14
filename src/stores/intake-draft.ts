import { create } from "zustand";
import type { Vec3 } from "@/components/body-map/regions";
import type { BodyView } from "@/components/body-map/types";
import { REGIONS, type RegionId } from "@/lib/regions";
import type { IntakeRegion, TriageLevel } from "@/lib/schemas";

export type IntakeStep = "select" | "details" | "review" | "submitted";

export interface DraftRegion extends IntakeRegion {
  /** The patient has opened and saved this area's details at least once. */
  confirmed: boolean;
}

interface Submitted {
  id: string;
  level: TriageLevel;
}

interface IntakeDraftState {
  tenantSlug: string | null;
  step: IntakeStep;
  view: BodyView;
  activeId: RegionId | null;
  order: RegionId[];
  regions: Partial<Record<RegionId, DraftRegion>>;
  submitted: Submitted | null;

  startFor: (tenantSlug: string) => void;
  toggleRegion: (id: RegionId, pin?: Vec3 | null) => void;
  setActive: (id: RegionId | null) => void;
  setView: (view: BodyView) => void;
  updateRegion: (id: RegionId, patch: Partial<Omit<DraftRegion, "regionId">>) => void;
  confirmRegion: (id: RegionId) => void;
  removeRegion: (id: RegionId) => void;
  goTo: (step: IntakeStep) => void;
  markSubmitted: (submitted: Submitted) => void;
  reset: () => void;
}

const EMPTY = {
  step: "select" as IntakeStep,
  view: "front" as BodyView,
  activeId: null,
  order: [] as RegionId[],
  regions: {},
  submitted: null,
};

function viewFor(id: RegionId, current: BodyView): BodyView {
  const facing = REGIONS[id].facing;
  return facing === "both" ? current : facing;
}

export const useIntakeDraft = create<IntakeDraftState>()((set, get) => ({
  tenantSlug: null,
  ...EMPTY,

  startFor: (tenantSlug) => {
    if (get().tenantSlug !== tenantSlug) set({ tenantSlug, ...EMPTY });
  },

  toggleRegion: (id, pin = null) =>
    set((s) => {
      if (s.regions[id]) {
        const { [id]: _removed, ...rest } = s.regions;
        return {
          regions: rest,
          order: s.order.filter((r) => r !== id),
          activeId: s.activeId === id ? null : s.activeId,
        };
      }
      const region: DraftRegion = {
        regionId: id,
        severity: 5,
        quality: "aching",
        durationDays: 1,
        notes: "",
        pin: pin ? { x: pin[0], y: pin[1], z: pin[2] } : null,
        confirmed: false,
      };
      return {
        regions: { ...s.regions, [id]: region },
        order: [...s.order, id],
        activeId: id,
        view: viewFor(id, s.view),
      };
    }),

  setActive: (id) => set((s) => ({ activeId: id, view: id ? viewFor(id, s.view) : s.view })),

  setView: (view) => set({ view, activeId: null }),

  updateRegion: (id, patch) =>
    set((s) => {
      const existing = s.regions[id];
      if (!existing) return {};
      return { regions: { ...s.regions, [id]: { ...existing, ...patch } } };
    }),

  confirmRegion: (id) =>
    set((s) => {
      const existing = s.regions[id];
      if (!existing) return {};
      return {
        regions: { ...s.regions, [id]: { ...existing, confirmed: true } },
        activeId: s.activeId === id ? null : s.activeId,
      };
    }),

  removeRegion: (id) => {
    if (get().regions[id]) get().toggleRegion(id);
  },

  goTo: (step) => set({ step, activeId: null }),

  markSubmitted: (submitted) => set({ submitted, step: "submitted", activeId: null }),

  reset: () => set({ ...EMPTY }),
}));

export function draftRegionsInOrder(state: Pick<IntakeDraftState, "order" | "regions">) {
  return state.order.flatMap((id) => {
    const region = state.regions[id];
    return region ? [region] : [];
  });
}
