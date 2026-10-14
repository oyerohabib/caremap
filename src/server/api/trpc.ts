import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { ZodError, z } from "zod";
import type { Db } from "@/server/db";
import { tenants } from "@/server/db/schema";

export const TENANT_HEADER = "x-tenant";

export interface Context {
  db: Db;
  tenantSlug: string | null;
}

export function createContext(opts: { db: Db; headers: Headers }): Context {
  return { db: opts.db, tenantSlug: opts.headers.get(TENANT_HEADER) };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/**
 * Resolves the tenant from the `x-tenant` header. Every query behind this
 * procedure must filter by `ctx.tenant.id`; that is the isolation boundary.
 */
export const tenantProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.tenantSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing tenant" });
  }
  const [tenant] = await ctx.db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, ctx.tenantSlug))
    .limit(1);
  if (!tenant) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Unknown tenant" });
  }
  return next({ ctx: { ...ctx, tenant } });
});
