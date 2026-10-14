import { createDb } from "./index";
import { seedDemoData } from "./seed-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL to the Neon connection string to seed");
  const db = await createDb(url);
  await seedDemoData(db);
  console.log("Seeded demo tenants and intakes");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
