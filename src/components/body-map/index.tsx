"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { BodyMapPoster } from "./poster";
import type { BodyMapProps } from "./types";

const BodyMapCanvas = dynamic(() => import("./body-map-canvas"), {
  ssr: false,
  loading: () => <BodyMapPoster />,
});

export function BodyMap({ className, ...props }: BodyMapProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <BodyMapCanvas {...props} />
    </div>
  );
}

export type { BodyMapPin, BodyMapProps, BodyView } from "./types";
export { BodyMapPoster };
