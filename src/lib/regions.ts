export const REGION_IDS = [
  "head",
  "neck",
  "chest",
  "abdomen",
  "pelvis",
  "upper_back",
  "lower_back",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "left_thigh",
  "right_thigh",
  "left_shin",
  "right_shin",
  "left_foot",
  "right_foot",
] as const;

export type RegionId = (typeof REGION_IDS)[number];

export type RegionArea = "head" | "torso" | "arms" | "legs";

/** Which side of the body the region is visible from. */
export type RegionFacing = "front" | "back" | "both";

export interface RegionInfo {
  id: RegionId;
  label: string;
  area: RegionArea;
  facing: RegionFacing;
}

export const REGIONS: Record<RegionId, RegionInfo> = {
  head: { id: "head", label: "Head", area: "head", facing: "both" },
  neck: { id: "neck", label: "Neck", area: "head", facing: "both" },
  chest: { id: "chest", label: "Chest", area: "torso", facing: "front" },
  abdomen: { id: "abdomen", label: "Abdomen", area: "torso", facing: "front" },
  pelvis: { id: "pelvis", label: "Pelvis / hips", area: "torso", facing: "both" },
  upper_back: { id: "upper_back", label: "Upper back", area: "torso", facing: "back" },
  lower_back: { id: "lower_back", label: "Lower back", area: "torso", facing: "back" },
  left_upper_arm: { id: "left_upper_arm", label: "Left upper arm", area: "arms", facing: "both" },
  right_upper_arm: { id: "right_upper_arm", label: "Right upper arm", area: "arms", facing: "both" },
  left_forearm: { id: "left_forearm", label: "Left forearm", area: "arms", facing: "both" },
  right_forearm: { id: "right_forearm", label: "Right forearm", area: "arms", facing: "both" },
  left_hand: { id: "left_hand", label: "Left hand", area: "arms", facing: "both" },
  right_hand: { id: "right_hand", label: "Right hand", area: "arms", facing: "both" },
  left_thigh: { id: "left_thigh", label: "Left thigh", area: "legs", facing: "both" },
  right_thigh: { id: "right_thigh", label: "Right thigh", area: "legs", facing: "both" },
  left_shin: { id: "left_shin", label: "Left lower leg", area: "legs", facing: "both" },
  right_shin: { id: "right_shin", label: "Right lower leg", area: "legs", facing: "both" },
  left_foot: { id: "left_foot", label: "Left foot", area: "legs", facing: "both" },
  right_foot: { id: "right_foot", label: "Right foot", area: "legs", facing: "both" },
};

export const AREA_LABELS: Record<RegionArea, string> = {
  head: "Head & neck",
  torso: "Torso",
  arms: "Arms",
  legs: "Legs",
};

export function regionLabel(id: string): string {
  return (REGIONS as Record<string, RegionInfo | undefined>)[id]?.label ?? id;
}
