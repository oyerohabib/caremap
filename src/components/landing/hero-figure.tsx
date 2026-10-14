"use client";

import { useEffect, useState } from "react";
import { BodyMap, type BodyMapPin } from "@/components/body-map";
import { BrandProvider } from "@/hooks/use-brand-colors";
import { useReducedMotion } from "@/hooks/use-media-query";
import type { RegionId } from "@/lib/regions";

const SCENES: { regions: RegionId[]; pins: BodyMapPin[] }[] = [
  {
    regions: ["lower_back", "right_thigh"],
    pins: [
      { id: "a", regionId: "lower_back", position: null, severity: 7 },
      { id: "b", regionId: "right_thigh", position: null, severity: 4 },
    ],
  },
  {
    regions: ["head", "neck"],
    pins: [
      { id: "c", regionId: "head", position: null, severity: 5 },
      { id: "d", regionId: "neck", position: null, severity: 3 },
    ],
  },
  {
    regions: ["left_hand", "left_forearm", "chest"],
    pins: [
      { id: "e", regionId: "left_hand", position: null, severity: 3 },
      { id: "f", regionId: "chest", position: null, severity: 8 },
    ],
  },
];

/** Idle hero: a highlight change every few seconds, so the GPU renders ~150 ms per cycle. */
export function HeroFigure() {
  const reducedMotion = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setScene((s) => (s + 1) % SCENES.length), 2800);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const current = SCENES[scene];

  return (
    <BrandProvider colors={{ primary: "#0f766e", accent: "#14b8a6" }}>
      <BodyMap
        selectedIds={current.regions}
        pins={current.pins}
        interactive={false}
        ariaLabel="Illustration: a 3D body figure with highlighted areas of pain"
      />
    </BrandProvider>
  );
}
