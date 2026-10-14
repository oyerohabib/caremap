import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { intakeRouter } from "./routers/intake";
import { healthRouter, tenantRouter } from "./routers/tenant";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  tenant: tenantRouter,
  intake: intakeRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const createCaller = createCallerFactory(appRouter);
