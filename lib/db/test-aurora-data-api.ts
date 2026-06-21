import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import {
  ExecuteStatementCommand,
  type Field,
  RDSDataClient,
} from "@aws-sdk/client-rds-data";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function fieldToValue(field: Field) {
  if ("stringValue" in field) return field.stringValue;
  if ("longValue" in field) return field.longValue;
  if ("doubleValue" in field) return field.doubleValue;
  if ("booleanValue" in field) return field.booleanValue;
  if ("isNull" in field) return null;
  return field;
}

async function main() {
  const region = process.env.AWS_REGION || "us-east-1";
  const resourceArn = requiredEnv("AURORA_CLUSTER_ARN");
  const secretArn = requiredEnv("AURORA_SECRET_ARN");
  const database = process.env.AURORA_DATABASE || "polaris";

  const client = new RDSDataClient({ region });

  const result = await client.send(
    new ExecuteStatementCommand({
      resourceArn,
      secretArn,
      database,
      sql: `
        select 'cities' as table_name, count(*)::bigint as count from cities
        union all
        select 'neighborhood_profiles', count(*)::bigint from neighborhood_profiles
        union all
        select 'user_profiles', count(*)::bigint from user_profiles
        union all
        select 'api_response_cache', count(*)::bigint from api_response_cache
        order by table_name
      `,
    }),
  );

  const rows = (result.records ?? []).map((record) => ({
    table_name: fieldToValue(record[0] ?? {}),
    count: fieldToValue(record[1] ?? {}),
  }));

  console.table(rows);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
