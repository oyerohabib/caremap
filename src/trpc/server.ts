import "server-only";
import { cache } from "react";
import { createCaller } from "@/server/api/root";
import { getDb } from "@/server/db";

/** Server-component caller, scoped to one tenant like a browser request would be. */
export const serverCaller = cache(async (tenantSlug?: string) =>
  createCaller({ db: await getDb(), tenantSlug: tenantSlug ?? null }),
);
