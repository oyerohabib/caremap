"use client";

import { createContext, useContext } from "react";
import type { BrandColors } from "@/lib/brand";

const DEFAULT_BRAND: BrandColors = { primary: "#0f172a", accent: "#38bdf8" };

const BrandContext = createContext<BrandColors>(DEFAULT_BRAND);

/** Fed from the same tenant row that sets `--brand` / `--brand-accent` on the DOM. */
export function BrandProvider({
  colors,
  children,
}: {
  colors: BrandColors;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={colors}>{children}</BrandContext.Provider>;
}

export function useBrandColors(): BrandColors {
  return useContext(BrandContext);
}
