//import "server-only";

// import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
// import postgres from "postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";

import * as schema from "@/lib/db/schema-minimal";

// type DB = PostgresJsDatabase<typeof schema>;

// let _db: DB | null = null;

// function getDb(): DB {
//   if (_db) return _db;

//   const connectionString = process.env.DATABASE_URL || process.env.post;
//   if (!connectionString) {
//     throw new Error("DATABASE_URL is required for database access.");
//   }

//   const queryClient = postgres(connectionString, {
//     max: 1,
//     prepare: false,
//   });

//   _db = drizzle(queryClient, { schema });
//   return _db;
// }

const signer = new Signer({
  hostname: process.env.PGHOST!,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER!,
  region: process.env.AWS_REGION,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
});

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getAuthToken(),
  port: Number(process.env.PGPORT),
  ssl: false,
  max: 20,
});

export const db = drizzle(pool, {
  schema,
});


// Lazily initialize the connection so that importing this module does not
// require DATABASE_URL at build time. The connection is only created on first
// access at runtime.
// export const db = new Proxy({} as DB, {
//   get(_target, prop, receiver) {
//     const instance = getDb();
//     const value = Reflect.get(instance as object, prop, receiver);
//     return typeof value === "function" ? value.bind(instance) : value;
//   },
// });
