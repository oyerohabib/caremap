"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Color, MathUtils, type Mesh, type MeshStandardMaterial } from "three";
import type { RegionId } from "@/lib/regions";
import type { RegionGeometry, Vec3 } from "./regions";

const BASE_COLOR = new Color("#e4ddd5");
/** Pointer travel (px) beyond which a press counts as an orbit drag, not a tap. */
const TAP_SLOP_PX = 6;
/** ~150 ms to settle. */
const GLOW_LAMBDA = 20;
const GLOW = { idle: 0, hover: 0.16, selected: 0.55, active: 0.95 } as const;

interface RegionMeshProps {
  geometry: RegionGeometry;
  label: string;
  selected: boolean;
  active: boolean;
  interactive: boolean;
  accent: string;
  reducedMotion: boolean;
  toLocal: (worldPoint: Vec3) => Vec3;
  onTap?: (id: RegionId, point: Vec3) => void;
}

function RegionShapeGeometry({ shape }: { shape: RegionGeometry["shape"] }) {
  switch (shape.kind) {
    case "sphere":
      return <sphereGeometry args={[1, 40, 28]} />;
    case "capsule":
      return <capsuleGeometry args={[shape.radius, shape.length, 10, 24]} />;
    case "shell":
      return (
        <sphereGeometry args={[1, 40, 28, shape.half === "front" ? 0 : Math.PI, Math.PI]} />
      );
  }
}

export const RegionMesh = memo(function RegionMesh({
  geometry,
  label,
  selected,
  active,
  interactive,
  accent,
  reducedMotion,
  toLocal,
  onTap,
}: RegionMeshProps) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const glow = useRef(0);
  const [hovered, setHovered] = useState(false);
  const invalidate = useThree((s) => s.invalidate);
  const accentColor = useMemo(() => new Color(accent), [accent]);
  const tint = useMemo(() => BASE_COLOR.clone().lerp(accentColor, 0.45), [accentColor]);

  const target = active ? GLOW.active : selected ? GLOW.selected : hovered ? GLOW.hover : GLOW.idle;

  // With an on-demand frameloop, a freshly (re)mounted mesh can be raycast
  // before any frame has computed its world matrix.
  useLayoutEffect(() => {
    mesh.current?.updateWorldMatrix(true, false);
  });

  useEffect(() => {
    invalidate();
  }, [target, accent, invalidate]);

  useFrame((_, delta) => {
    const m = material.current;
    if (!m) return;
    const next = reducedMotion
      ? target
      : MathUtils.damp(glow.current, target, GLOW_LAMBDA, Math.min(delta, 1 / 30));
    glow.current = Math.abs(next - target) < 0.002 ? target : next;
    if (glow.current !== target) invalidate();

    m.emissive.copy(accentColor);
    m.emissiveIntensity = glow.current * 0.55;
    m.color.lerpColors(BASE_COLOR, tint, Math.min(glow.current / GLOW.selected, 1));
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive || !onTap || e.delta > TAP_SLOP_PX) return;
    e.stopPropagation();
    onTap(geometry.id, toLocal([e.point.x, e.point.y, e.point.z]));
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive || e.pointerType !== "mouse") return;
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handleOut = () => {
    if (!hovered) return;
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <mesh
      ref={mesh}
      name={label}
      position={geometry.position}
      rotation={geometry.rotation ?? [0, 0, 0]}
      scale={geometry.scale ?? [1, 1, 1]}
      onClick={interactive ? handleClick : undefined}
      onPointerOver={interactive ? handleOver : undefined}
      onPointerOut={interactive ? handleOut : undefined}
    >
      <RegionShapeGeometry shape={geometry.shape} />
      <meshStandardMaterial
        ref={material}
        color={BASE_COLOR}
        roughness={0.62}
        metalness={0.02}
        envMapIntensity={0.9}
      />
    </mesh>
  );
});
