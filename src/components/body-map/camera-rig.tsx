"use client";

import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { REGIONS, type RegionId } from "@/lib/regions";
import { BODY_CENTER, REGION_GEOMETRY } from "./regions";
import type { BodyView } from "./types";

const { ACTION } = CameraControlsImpl;
const POLAR_REST = Math.PI / 2 - 0.06;
const HALF_FOV_TAN = Math.tan((30 / 2) * (Math.PI / 180));
const BODY_HALF_HEIGHT = 0.98;
const BODY_HALF_WIDTH = 0.42;

interface CameraRigProps {
  view: BodyView;
  focusId: RegionId | null;
  reducedMotion: boolean;
  interactive: boolean;
}

export function CameraRig({ view, focusId, reducedMotion, interactive }: CameraRigProps) {
  const controls = useRef<CameraControlsImpl>(null);
  const hasPositioned = useRef(false);
  const aspect = useThree((s) => s.size.width / Math.max(s.size.height, 1));

  const fitDistance = Math.max(
    BODY_HALF_HEIGHT / HALF_FOV_TAN,
    BODY_HALF_WIDTH / (HALF_FOV_TAN * aspect),
  ) + 0.3;

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.mouseButtons.right = ACTION.NONE;
    c.mouseButtons.middle = ACTION.NONE;
    c.mouseButtons.wheel = interactive ? ACTION.DOLLY : ACTION.NONE;
    c.touches.two = interactive ? ACTION.TOUCH_DOLLY : ACTION.NONE;
    c.touches.three = ACTION.NONE;
  }, [interactive]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const animate = hasPositioned.current && !reducedMotion;
    hasPositioned.current = true;
    c.normalizeRotations();

    if (focusId) {
      const g = REGION_GEOMETRY[focusId];
      const facing = REGIONS[focusId].facing;
      const side = facing === "front" ? 1 : facing === "back" ? -1 : view === "front" ? 1 : -1;
      const [x, y, z] = g.position;
      void c.setLookAt(x * 0.6, y + 0.06, z + side * g.focusDistance, x, y, z, animate);
      return;
    }

    const [tx, ty, tz] = BODY_CENTER;
    void c.setTarget(tx, ty, tz, animate);
    void c.dollyTo(fitDistance, animate);
    void c.rotateTo(view === "front" ? 0 : Math.PI, POLAR_REST, animate);
  }, [focusId, view, fitDistance, reducedMotion]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={reducedMotion ? 0 : 0.32}
      minPolarAngle={POLAR_REST - 0.32}
      maxPolarAngle={POLAR_REST + 0.2}
      minDistance={0.7}
      maxDistance={fitDistance + 1.5}
      dollyToCursor={false}
      enabled={interactive}
    />
  );
}
