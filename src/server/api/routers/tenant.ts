import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { tenants } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tenantRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const [tenant] = await ctx.db
        .select({
          slug: tenants.slug,
          name: tenants.name,
          primaryColor: tenants.primaryColor,
          accentColor: tenants.accentColor,
        })
        .from(tenants)
        .where(eq(tenants.slug, input.slug))
        .limit(1);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "Unknown tenant" });
      return tenant;
    }),
});

export const healthRouter = createTRPCRouter({
  ping: publicProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({ tenants: sql<number>`count(*)`.mapWith(Number) })
      .from(tenants);
    return { ok: true, tenants: row?.tenants ?? 0, at: new Date() };
  }),
});
