import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { cities, neighborhoods, places } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const client = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(client);

  const rows = await db
    .select({
      city: cities.name,
      neighborhood: neighborhoods.name,
      placeCount: count(places.id),
    })
    .from(cities)
    .innerJoin(neighborhoods, eq(neighborhoods.cityId, cities.id))
    .leftJoin(places, eq(places.neighborhoodId, neighborhoods.id))
    .groupBy(cities.name, neighborhoods.name)
    .orderBy(cities.name, neighborhoods.name);

  console.table(rows);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
