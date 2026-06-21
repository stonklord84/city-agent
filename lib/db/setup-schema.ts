import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const schemaPath = join(process.cwd(), "lib/db/create-schema.sql");
  const schemaSql = await readFile(schemaPath, "utf8");
  const client = postgres(connectionString, { max: 1, prepare: false });

  try {
    await client.unsafe(schemaSql);
    console.log(" Neon schema is ready.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
