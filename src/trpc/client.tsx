"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/** One query cache per tenant so cached data can never leak across brands. */
export function TRPCReactProvider({
  tenantSlug,
  children,
}: {
  tenantSlug: string;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" &&
            op.direction === "down" &&
            op.result instanceof Error,
        }),
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers: () => ({ "x-tenant": tenantSlug }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
