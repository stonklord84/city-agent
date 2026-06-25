import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type DB = PostgresJsDatabase<typeof schema>;

let _db: DB | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function getDb(): DB {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to the project's environment variables.",
    );
  }

  _client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  _db = drizzle(_client, { schema });
  return _db;
}

export async function closeDb() {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

// Lazily initialize the connection so importing this module does not require
// DATABASE_URL at build time. The connection is created on first runtime access.
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
