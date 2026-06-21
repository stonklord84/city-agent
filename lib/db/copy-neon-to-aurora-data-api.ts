import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import {
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RDSDataClient,
  RollbackTransactionCommand,
} from "@aws-sdk/client-rds-data";
import postgres from "postgres";

type CityRow = {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  created_at: Date;
};

type NeighborhoodProfileRow = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  summary: string;
  vibe_tags: string[];
  best_for_tags: string[];
  rent_min: number;
  rent_max: number;
  lat: number;
  lng: number;
  walkability: number;
  transit: number;
  nightlife: number;
  safety: number;
  cafes: number;
  parks: number;
  young_professionals: number;
  affordability: number;
  diversity: number;
  places: unknown;
  commute_estimates: unknown;
  llm_profile: unknown;
  external_metrics: unknown;
  data_sources: unknown;
  data_source: string;
  created_at: Date;
  updated_at: Date;
};

type UserProfileRow = {
  id: string;
  auth_id: string;
  city_id: string;
  budget_min: number;
  budget_max: number;
  source_neighborhood_name: string | null;
  source_city_name: string | null;
  source_likes: string | null;
  source_dislikes: string | null;
  walkability_weight: number;
  transit_weight: number;
  nightlife_weight: number;
  safety_weight: number;
  cafes_weight: number;
  parks_weight: number;
  young_professionals_weight: number;
  affordability_weight: number;
  diversity_weight: number;
  matched_neighborhoods: unknown;
  source_place_context: unknown;
  chat_messages: unknown;
  last_selected_neighborhood_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type ApiResponseCacheRow = {
  id: string;
  provider: string;
  operation: string;
  model: string;
  cache_key: string;
  request_payload: unknown;
  response_payload: unknown;
  hit_count: number;
  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function sqlText(value: string | null | undefined) {
  if (value == null) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlDate(value: Date | string | null | undefined) {
  if (!value) return "null";
  const date = value instanceof Date ? value : new Date(value);
  return sqlText(date.toISOString());
}

function sqlNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "null";
  return String(value);
}

function sqlTextArray(values: string[] | null | undefined) {
  const items = (values ?? []).map(sqlText).join(", ");
  return `ARRAY[${items}]::text[]`;
}

function sqlJson(value: unknown) {
  return `${sqlText(JSON.stringify(value ?? {}))}::jsonb`;
}

async function main() {
  const sourceUrl = process.env.NEON_DATABASE_URL?.trim() || requiredEnv("DATABASE_URL");
  const region = process.env.AWS_REGION || "us-east-1";
  const resourceArn = requiredEnv("AURORA_CLUSTER_ARN");
  const secretArn = requiredEnv("AURORA_SECRET_ARN");
  const database = process.env.AURORA_DATABASE || "polaris";

  const source = postgres(sourceUrl, { max: 1, prepare: false });
  const client = new RDSDataClient({ region });

  const exec = async (sql: string, transactionId?: string) => {
    await client.send(
      new ExecuteStatementCommand({
        resourceArn,
        secretArn,
        database,
        transactionId,
        sql,
      }),
    );
  };

  try {
    console.log("Reading source rows...");
    const cities = await source<CityRow[]>`select * from cities order by created_at, id`;
    const neighborhoods = await source<NeighborhoodProfileRow[]>`
      select
        id,
        city_id,
        name,
        slug,
        summary,
        vibe_tags,
        best_for_tags,
        rent_min,
        rent_max,
        lat,
        lng,
        walkability,
        transit,
        nightlife,
        safety,
        cafes,
        parks,
        young_professionals,
        affordability,
        diversity,
        places,
        commute_estimates,
        llm_profile,
        coalesce(external_metrics, '{}'::jsonb) as external_metrics,
        coalesce(data_sources, '{}'::jsonb) as data_sources,
        data_source,
        created_at,
        updated_at
      from neighborhood_profiles
      order by created_at, id
    `;
    const users = await source<UserProfileRow[]>`
      select
        id,
        auth_id,
        city_id,
        budget_min,
        budget_max,
        source_neighborhood_name,
        source_city_name,
        source_likes,
        source_dislikes,
        walkability_weight,
        transit_weight,
        nightlife_weight,
        safety_weight,
        cafes_weight,
        parks_weight,
        young_professionals_weight,
        affordability_weight,
        diversity_weight,
        matched_neighborhoods,
        source_place_context,
        coalesce(chat_messages, '[]'::jsonb) as chat_messages,
        last_selected_neighborhood_id,
        created_at,
        updated_at
      from user_profiles
      order by created_at, id
    `;
    const cache = await source<ApiResponseCacheRow[]>`
      select * from api_response_cache order by created_at, id
    `;

    console.log(
      `Copying ${cities.length} cities, ${neighborhoods.length} neighborhoods, ${users.length} profiles, ${cache.length} cache rows via Data API...`,
    );

    const begin = await client.send(
      new BeginTransactionCommand({
        resourceArn,
        secretArn,
        database,
      }),
    );
    const transactionId = begin.transactionId;
    if (!transactionId) throw new Error("Aurora Data API did not return a transaction id.");

    try {
      await exec("delete from api_response_cache", transactionId);
      await exec("delete from user_profiles", transactionId);
      await exec("delete from neighborhood_profiles", transactionId);
      await exec("delete from cities", transactionId);

      for (const row of cities) {
        await exec(
          `
            insert into cities (id, name, slug, country, currency, created_at)
            values (
              ${sqlText(row.id)},
              ${sqlText(row.name)},
              ${sqlText(row.slug)},
              ${sqlText(row.country)},
              ${sqlText(row.currency)},
              ${sqlDate(row.created_at)}
            )
          `,
          transactionId,
        );
      }

      for (const row of neighborhoods) {
        await exec(
          `
            insert into neighborhood_profiles (
              id, city_id, name, slug, summary, vibe_tags, best_for_tags,
              rent_min, rent_max, lat, lng, coordinates,
              walkability, transit, nightlife, safety, cafes, parks,
              young_professionals, affordability, diversity,
              places, commute_estimates, llm_profile, external_metrics,
              data_sources, data_source, created_at, updated_at
            )
            values (
              ${sqlText(row.id)},
              ${sqlText(row.city_id)},
              ${sqlText(row.name)},
              ${sqlText(row.slug)},
              ${sqlText(row.summary)},
              ${sqlTextArray(row.vibe_tags)},
              ${sqlTextArray(row.best_for_tags)},
              ${sqlNumber(row.rent_min)},
              ${sqlNumber(row.rent_max)},
              ${sqlNumber(row.lat)},
              ${sqlNumber(row.lng)},
              ST_SetSRID(ST_MakePoint(${sqlNumber(row.lng)}, ${sqlNumber(row.lat)}), 4326)::geography,
              ${sqlNumber(row.walkability)},
              ${sqlNumber(row.transit)},
              ${sqlNumber(row.nightlife)},
              ${sqlNumber(row.safety)},
              ${sqlNumber(row.cafes)},
              ${sqlNumber(row.parks)},
              ${sqlNumber(row.young_professionals)},
              ${sqlNumber(row.affordability)},
              ${sqlNumber(row.diversity)},
              ${sqlJson(row.places)},
              ${sqlJson(row.commute_estimates)},
              ${sqlJson(row.llm_profile)},
              ${sqlJson(row.external_metrics)},
              ${sqlJson(row.data_sources)},
              ${sqlText(row.data_source)},
              ${sqlDate(row.created_at)},
              ${sqlDate(row.updated_at)}
            )
          `,
          transactionId,
        );
      }

      for (const row of users) {
        await exec(
          `
            insert into user_profiles (
              id, auth_id, city_id, budget_min, budget_max,
              source_neighborhood_name, source_city_name, source_likes,
              source_dislikes, walkability_weight, transit_weight,
              nightlife_weight, safety_weight, cafes_weight, parks_weight,
              young_professionals_weight, affordability_weight, diversity_weight,
              matched_neighborhoods, source_place_context, chat_messages,
              last_selected_neighborhood_id, created_at, updated_at
            )
            values (
              ${sqlText(row.id)},
              ${sqlText(row.auth_id)},
              ${sqlText(row.city_id)},
              ${sqlNumber(row.budget_min)},
              ${sqlNumber(row.budget_max)},
              ${sqlText(row.source_neighborhood_name)},
              ${sqlText(row.source_city_name)},
              ${sqlText(row.source_likes)},
              ${sqlText(row.source_dislikes)},
              ${sqlNumber(row.walkability_weight)},
              ${sqlNumber(row.transit_weight)},
              ${sqlNumber(row.nightlife_weight)},
              ${sqlNumber(row.safety_weight)},
              ${sqlNumber(row.cafes_weight)},
              ${sqlNumber(row.parks_weight)},
              ${sqlNumber(row.young_professionals_weight)},
              ${sqlNumber(row.affordability_weight)},
              ${sqlNumber(row.diversity_weight)},
              ${sqlJson(row.matched_neighborhoods)},
              ${sqlJson(row.source_place_context)},
              ${sqlText(JSON.stringify(row.chat_messages ?? []))}::jsonb,
              ${sqlText(row.last_selected_neighborhood_id)},
              ${sqlDate(row.created_at)},
              ${sqlDate(row.updated_at)}
            )
          `,
          transactionId,
        );
      }

      for (const row of cache) {
        await exec(
          `
            insert into api_response_cache (
              id, provider, operation, model, cache_key,
              request_payload, response_payload, hit_count,
              created_at, updated_at, last_accessed_at
            )
            values (
              ${sqlText(row.id)},
              ${sqlText(row.provider)},
              ${sqlText(row.operation)},
              ${sqlText(row.model)},
              ${sqlText(row.cache_key)},
              ${sqlJson(row.request_payload)},
              ${sqlJson(row.response_payload)},
              ${sqlNumber(row.hit_count)},
              ${sqlDate(row.created_at)},
              ${sqlDate(row.updated_at)},
              ${sqlDate(row.last_accessed_at)}
            )
          `,
          transactionId,
        );
      }

      await client.send(
        new CommitTransactionCommand({
          resourceArn,
          secretArn,
          transactionId,
        }),
      );
    } catch (error) {
      await client.send(
        new RollbackTransactionCommand({
          resourceArn,
          secretArn,
          transactionId,
        }),
      );
      throw error;
    }

    const counts = await client.send(
      new ExecuteStatementCommand({
        resourceArn,
        secretArn,
        database,
        sql: `
          select c.slug, count(np.id)::bigint as neighborhoods
          from cities c
          left join neighborhood_profiles np on np.city_id = c.id
          group by c.slug
          order by c.slug
        `,
      }),
    );

    console.log("Aurora counts after Data API copy:");
    console.table(
      (counts.records ?? []).map((record) => ({
        slug: record[0]?.stringValue,
        neighborhoods: Number(record[1]?.longValue ?? 0),
      })),
    );
  } finally {
    await source.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
