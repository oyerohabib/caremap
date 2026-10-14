import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / PPR are left off: every page here is per-tenant and
  // request-time, and OpenNext (used by sst.aws.Nextjs) is most predictable
  // with classic dynamic rendering.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
