"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { severityColor } from "@/lib/severity";
import { REGION_GEOMETRY } from "./regions";
import type { BodyMapPin } from "./types";

const MAX_PINS = 32;
const scratch = new Object3D();
const scratchColor = new Color();

/**
 * All pins share one instanced draw call. Matrices are written directly so the
 * very first on-demand frame already has them in place.
 */
export function Pins({ pins }: { pins: readonly BodyMapPin[] }) {
  const mesh = useRef<InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const visible = pins.slice(0, MAX_PINS);
    visible.forEach((pin, i) => {
      scratch.position.set(...(pin.position ?? REGION_GEOMETRY[pin.regionId].anchor));
      scratch.updateMatrix();
      m.setMatrixAt(i, scratch.matrix);
      m.setColorAt(i, scratchColor.set(severityColor(pin.severity)));
    });
    m.count = visible.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    invalidate();
  }, [pins, invalidate]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_PINS]} frustumCulled={false}>
      <sphereGeometry args={[0.024, 20, 14]} />
      <meshStandardMaterial roughness={0.35} metalness={0} toneMapped={false} />
    </instancedMesh>
  );
}
