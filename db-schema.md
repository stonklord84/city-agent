# Current DB Schema

This file is the project-facing source of truth for the intended MVP database shape.
Update it whenever the schema changes.

The app is intentionally using a small three-table model:

```txt
cities
  └── neighborhood_profiles
  └── user_profiles
```

Current development storage is Neon Postgres via `DATABASE_URL`.
Production storage will later move to AWS Aurora PostgreSQL with PostGIS enabled.

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## cities

Stores the three launch cities.

```sql
CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Launch rows:

```txt
toronto | Toronto | Canada | USD
mumbai  | Mumbai | India | USD
nyc     | New York City | United States | USD
```

## neighborhood_profiles

Stores one complete local-knowledge profile per neighborhood. This table references `cities`.

It intentionally contains the matching vector, nearby places, and commute snippets so the MVP does not need extra tables.

```sql
CREATE TABLE neighborhood_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  name text NOT NULL,
  slug text NOT NULL,
  summary text NOT NULL,
  vibe_tags text[] NOT NULL DEFAULT '{}',
  best_for_tags text[] NOT NULL DEFAULT '{}',

  rent_min integer NOT NULL,
  rent_max integer NOT NULL,

  lat real NOT NULL,
  lng real NOT NULL,
  coordinates geography(Point,4326) NOT NULL,

  walkability real NOT NULL DEFAULT 0.5,
  transit real NOT NULL DEFAULT 0.5,
  nightlife real NOT NULL DEFAULT 0.5,
  safety real NOT NULL DEFAULT 0.5,
  cafes real NOT NULL DEFAULT 0.5,
  parks real NOT NULL DEFAULT 0.5,
  young_professionals real NOT NULL DEFAULT 0.5,
  affordability real NOT NULL DEFAULT 0.5,
  diversity real NOT NULL DEFAULT 0.5,

  places jsonb NOT NULL DEFAULT '[]'::jsonb,
  commute_estimates jsonb NOT NULL DEFAULT '[]'::jsonb,
  llm_profile jsonb NOT NULL DEFAULT '{}'::jsonb,

  data_source text NOT NULL DEFAULT 'seeded',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT neighborhood_profiles_rent_check CHECK (rent_min <= rent_max),
  CONSTRAINT neighborhood_profiles_city_slug_unique UNIQUE (city_id, slug)
);
```

`places` JSON shape:

```ts
type NeighborhoodPlace = {
  name: string;
  category: "food" | "nightlife" | "wellness" | "practical";
  summary: string;
  priceRange?: string;
  vibeTags: string[];
  bestForTags: string[];
  lat?: number;
  lng?: number;
};
```

`commute_estimates` JSON shape:

```ts
type CommuteEstimate = {
  destination: string;
  minutes: number;
  mode: "walk" | "bike" | "transit" | "drive";
  notes?: string;
};
```

`llm_profile` JSON shape:

```ts
type LlmNeighborhoodProfile = {
  summary?: string;
  vibeTags?: string[];
  bestForTags?: string[];
  featureNotes?: Record<string, string>;
  generatedBy?: string;
  generatedAt?: string;
};
```

## user_profiles

Stores the user/session preference profile. Auth is still deferred, so `auth_id` may remain `demo-user` for now.

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id text NOT NULL DEFAULT 'demo-user',
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,

  budget_min integer NOT NULL,
  budget_max integer NOT NULL,
  source_neighborhood_name text,
  source_city_name text,
  source_likes text,
  source_dislikes text,

  walkability_weight real NOT NULL DEFAULT 0.5,
  transit_weight real NOT NULL DEFAULT 0.5,
  nightlife_weight real NOT NULL DEFAULT 0.5,
  safety_weight real NOT NULL DEFAULT 0.5,
  cafes_weight real NOT NULL DEFAULT 0.5,
  parks_weight real NOT NULL DEFAULT 0.5,
  young_professionals_weight real NOT NULL DEFAULT 0.5,
  affordability_weight real NOT NULL DEFAULT 0.5,
  diversity_weight real NOT NULL DEFAULT 0.5,

  matched_neighborhoods jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_place_context jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

`matched_neighborhoods` JSON shape:

```ts
type MatchedNeighborhood = {
  neighborhoodProfileId: string;
  score: number;
  reasons: string[];
};
```

`source_place_context` JSON shape:

```ts
type SourcePlaceContext = {
  sourceNeighborhood?: string;
  sourceCity?: string;
  likes?: string;
  dislikes?: string;
  preferences?: Record<string, number>;
  generatedBy?: string;
  generatedAt?: string;
};
```

## Enrichment Flow

`npm run db:setup:minimal` creates the three-table model in the active Neon database.

`npm run db:enrich` populates the three-table model.

`npm run db:fill:groq` uses Groq to fill `llm_profile`, refreshed tags, concise summaries, and neighborhood-to-neighborhood commute snippets for the already-seeded rows.

Inputs:

- `lib/db/seed-data.ts` for planned launch cities, neighborhoods, summaries, tags, and initial places.
- `lib/db/seed-features.ts` for matching vectors.
- TomTom Search API for POI enrichment when `TOMTOM_API_KEY` is set.

Output:

- Upserted `cities`.
- Upserted `neighborhood_profiles`.
- API-enriched `places` stored in `neighborhood_profiles.places`.
- Groq-enriched profile context stored in `neighborhood_profiles.llm_profile`.
