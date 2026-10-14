"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { Vector3, type Group } from "three";
import { useBrandColors } from "@/hooks/use-brand-colors";
import { useReducedMotion } from "@/hooks/use-media-query";
import { REGION_IDS, REGIONS } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { CameraRig } from "./camera-rig";
import { Pins } from "./pins";
import { BodyMapPoster } from "./poster";
import { RegionMesh } from "./region-mesh";
import { REGION_GEOMETRY, type Vec3 } from "./regions";
import { Stage } from "./stage";
import type { BodyMapProps } from "./types";

const Perf =
  process.env.NODE_ENV === "development"
    ? lazy(() => import("@react-three/drei").then((m) => ({ default: m.StatsGl })))
    : null;

const NO_PINS: NonNullable<BodyMapProps["pins"]> = [];

export default function BodyMapCanvas({
  selectedIds,
  activeId = null,
  pins = NO_PINS,
  view = "front",
  interactive = true,
  orbit = interactive,
  focusActive = true,
  onRegionTap,
  ariaLabel,
  className,
}: BodyMapProps) {
  const { accent } = useBrandColors();
  const reducedMotion = useReducedMotion();
  const [dpr, setDpr] = useState<number | [number, number]>([1, 2]);
  const root = useRef<Group>(null);
  const [showPerf] = useState(
    () => Perf !== null && new URLSearchParams(window.location.search).has("perf"),
  );

  const toLocal = useCallback((p: Vec3): Vec3 => {
    const v = new Vector3(...p);
    root.current?.worldToLocal(v);
    return [round(v.x), round(v.y), round(v.z)];
  }, []);

  const selected = new Set(selectedIds);

  return (
    <Canvas
      role="img"
      aria-label={ariaLabel}
      className={cn(orbit && "touch-none", "select-none", className)}
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: 30, near: 0.05, far: 40, position: [0, 1, 4] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={<BodyMapPoster message="3D view isn't available on this device. Use the list of body areas instead." />}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr([1, 2])}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <Stage />
      <group ref={root}>
        {REGION_IDS.map((id) => (
          <RegionMesh
            key={id}
            geometry={REGION_GEOMETRY[id]}
            label={REGIONS[id].label}
            selected={selected.has(id)}
            active={activeId === id}
            interactive={interactive}
            accent={accent}
            reducedMotion={reducedMotion}
            toLocal={toLocal}
            onTap={onRegionTap}
          />
        ))}
        <Pins pins={pins} />
      </group>
      <CameraRig
        view={view}
        focusId={focusActive ? activeId : null}
        reducedMotion={reducedMotion}
        interactive={orbit}
      />
      {showPerf && Perf ? (
        <Suspense fallback={null}>
          <Perf className="!absolute" />
        </Suspense>
      ) : null}
    </Canvas>
  );
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
