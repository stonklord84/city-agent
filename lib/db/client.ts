import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema-minimal";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for database access.");
}

const queryClient = postgres(connectionString, {
  max: 1,
  prepare: false,
});

export const db = drizzle(queryClient, { schema });
