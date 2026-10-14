"use client";

import { createContext, useContext } from "react";
import { BrandProvider } from "@/hooks/use-brand-colors";
import type { BrandColors } from "@/lib/brand";

interface TenantInfo {
  slug: string;
  name: string;
}

const TenantContext = createContext<TenantInfo | null>(null);

export function TenantProvider({
  tenant,
  colors,
  children,
}: {
  tenant: TenantInfo;
  colors: BrandColors;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      <BrandProvider colors={colors}>{children}</BrandProvider>
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantInfo {
  const tenant = useContext(TenantContext);
  if (!tenant) throw new Error("useTenant must be used inside a tenant route");
  return tenant;
}
