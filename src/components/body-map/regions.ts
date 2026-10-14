import { REGION_IDS, type RegionId } from "@/lib/regions";

export type Vec3 = [number, number, number];

export type RegionShape =
  | { kind: "sphere" }
  | { kind: "capsule"; radius: number; length: number }
  /** Unit hemisphere facing +z (front) or -z (back), scaled into a half-ellipsoid. */
  | { kind: "shell"; half: "front" | "back" };

export interface RegionGeometry {
  id: RegionId;
  shape: RegionShape;
  position: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  /** Default pin location on the surface, used when a region is picked from the list. */
  anchor: Vec3;
  /** Camera distance when this region is focused. */
  focusDistance: number;
}

type Side = "left" | "right";

/** Patient's left is +x: the figure faces the camera along +z. */
const sx = (side: Side) => (side === "left" ? 1 : -1);

function limbs(side: Side): RegionGeometry[] {
  const s = sx(side);
  return [
    {
      id: `${side}_upper_arm`,
      shape: { kind: "capsule", radius: 0.05, length: 0.2 },
      position: [0.25 * s, 1.24, 0],
      rotation: [0, 0, 0.12 * s],
      anchor: [0.25 * s, 1.24, 0.05],
      focusDistance: 1.3,
    },
    {
      id: `${side}_forearm`,
      shape: { kind: "capsule", radius: 0.042, length: 0.19 },
      position: [0.285 * s, 0.955, 0],
      rotation: [0, 0, 0.05 * s],
      anchor: [0.285 * s, 0.955, 0.042],
      focusDistance: 1.2,
    },
    {
      id: `${side}_hand`,
      shape: { kind: "sphere" },
      position: [0.295 * s, 0.77, 0],
      scale: [0.04, 0.065, 0.026],
      anchor: [0.295 * s, 0.77, 0.026],
      focusDistance: 1,
    },
    {
      id: `${side}_thigh`,
      shape: { kind: "capsule", radius: 0.072, length: 0.28 },
      position: [0.095 * s, 0.62, 0],
      anchor: [0.095 * s, 0.62, 0.072],
      focusDistance: 1.5,
    },
    {
      id: `${side}_shin`,
      shape: { kind: "capsule", radius: 0.055, length: 0.29 },
      position: [0.095 * s, 0.27, 0],
      anchor: [0.095 * s, 0.27, 0.055],
      focusDistance: 1.4,
    },
    {
      id: `${side}_foot`,
      shape: { kind: "capsule", radius: 0.04, length: 0.1 },
      position: [0.095 * s, 0.04, 0.045],
      rotation: [Math.PI / 2, 0, 0],
      anchor: [0.095 * s, 0.07, 0.08],
      focusDistance: 1.1,
    },
  ] as RegionGeometry[];
}

const GEOMETRY: RegionGeometry[] = [
  {
    id: "head",
    shape: { kind: "sphere" },
    position: [0, 1.63, 0],
    scale: [0.106, 0.124, 0.115],
    anchor: [0, 1.65, 0.112],
    focusDistance: 1.2,
  },
  {
    id: "neck",
    shape: { kind: "capsule", radius: 0.052, length: 0.07 },
    position: [0, 1.47, 0],
    anchor: [0, 1.47, 0.05],
    focusDistance: 1.2,
  },
  {
    id: "chest",
    shape: { kind: "shell", half: "front" },
    position: [0, 1.27, 0],
    scale: [0.21, 0.18, 0.125],
    anchor: [0, 1.29, 0.12],
    focusDistance: 1.6,
  },
  {
    id: "upper_back",
    shape: { kind: "shell", half: "back" },
    position: [0, 1.27, 0],
    scale: [0.21, 0.18, 0.125],
    anchor: [0, 1.29, -0.12],
    focusDistance: 1.6,
  },
  {
    id: "abdomen",
    shape: { kind: "shell", half: "front" },
    position: [0, 1.04, 0],
    scale: [0.175, 0.15, 0.11],
    anchor: [0, 1.04, 0.105],
    focusDistance: 1.6,
  },
  {
    id: "lower_back",
    shape: { kind: "shell", half: "back" },
    position: [0, 1.04, 0],
    scale: [0.175, 0.15, 0.11],
    anchor: [0, 1.04, -0.105],
    focusDistance: 1.6,
  },
  {
    id: "pelvis",
    shape: { kind: "sphere" },
    position: [0, 0.87, 0],
    scale: [0.185, 0.11, 0.12],
    anchor: [0, 0.87, 0.115],
    focusDistance: 1.6,
  },
  ...limbs("left"),
  ...limbs("right"),
];

export const REGION_GEOMETRY = Object.fromEntries(
  GEOMETRY.map((g) => [g.id, g]),
) as Record<RegionId, RegionGeometry>;

if (process.env.NODE_ENV !== "production") {
  const missing = REGION_IDS.filter((id) => !REGION_GEOMETRY[id]);
  if (missing.length) throw new Error(`Missing region geometry: ${missing.join(", ")}`);
}

/** Point the camera orbits around when no region is focused. */
export const BODY_CENTER: Vec3 = [0, 0.9, 0];
