import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Resource } from "sst/resource";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/**
 * `pglite://memory` or `pglite://<dir>` runs an embedded Postgres (local dev,
 * CI, e2e) that is migrated and seeded on first use. Anything else is treated
 * as a Neon connection string.
 */
export async function createDb(url: string): Promise<Db> {
  if (url.startsWith("pglite:")) {
    const [{ PGlite }, { drizzle }, { migrate }, { seedDemoData }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("drizzle-orm/pglite"),
      import("drizzle-orm/pglite/migrator"),
      import("./seed-data"),
    ]);
    const dataDir = url.replace(/^pglite:(\/\/)?/, "");
    const client = !dataDir || dataDir === "memory" ? new PGlite() : new PGlite(dataDir);
    const db = drizzle({ client, schema, casing: "snake_case" });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    const existing = await db.select({ id: schema.tenants.id }).from(schema.tenants).limit(1);
    if (existing.length === 0) await seedDemoData(db as unknown as Db);
    return db as unknown as Db;
  }

  const [{ Pool, neonConfig }, { default: ws }, { drizzle }] = await Promise.all([
    import("@neondatabase/serverless"),
    import("ws"),
    import("drizzle-orm/neon-serverless"),
  ]);
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
  return drizzle({ client: pool, schema, casing: "snake_case" }) as unknown as Db;
}

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    // Throws outside `sst dev` / a deployed SST function, where nothing is linked.
    return Resource.DatabaseUrl.value;
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set and no SST DatabaseUrl secret is linked");
    }
    return "pglite://.pglite";
  }
}

const globalForDb = globalThis as unknown as { caremapDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  globalForDb.caremapDb ??= createDb(resolveDatabaseUrl()).catch((error) => {
    globalForDb.caremapDb = undefined;
    throw error;
  });
  return globalForDb.caremapDb;
}

export { schema };
