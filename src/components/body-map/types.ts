import type { RegionId } from "@/lib/regions";
import type { Vec3 } from "./regions";

export type BodyView = "front" | "back";

export interface BodyMapPin {
  id: string;
  regionId: RegionId;
  /** Body-local position; falls back to the region's anchor when null. */
  position: Vec3 | null;
  severity: number;
}

export interface BodyMapProps {
  selectedIds: readonly RegionId[];
  activeId?: RegionId | null;
  pins?: readonly BodyMapPin[];
  view?: BodyView;
  /** Regions can be tapped. */
  interactive?: boolean;
  /** The camera can be dragged / pinched. Defaults to `interactive`. */
  orbit?: boolean;
  /** Fly the camera to `activeId` when it changes. */
  focusActive?: boolean;
  onRegionTap?: (id: RegionId, point: Vec3) => void;
  ariaLabel: string;
  className?: string;
}
