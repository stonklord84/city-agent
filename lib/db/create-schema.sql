CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neighborhood_profiles (
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
  external_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_sources jsonb NOT NULL DEFAULT '{}'::jsonb,

  data_source text NOT NULL DEFAULT 'seeded',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT neighborhood_profiles_rent_check CHECK (rent_min <= rent_max),
  CONSTRAINT neighborhood_profiles_city_slug_unique UNIQUE (city_id, slug)
);

CREATE TABLE IF NOT EXISTS user_profiles (
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
  chat_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_selected_neighborhood_id text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_response_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  operation text NOT NULL,
  model text NOT NULL,
  cache_key text NOT NULL UNIQUE,
  request_payload jsonb NOT NULL,
  response_payload jsonb NOT NULL,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_response_cache_provider_operation_idx
  ON api_response_cache(provider, operation);

ALTER TABLE neighborhood_profiles
  ADD COLUMN IF NOT EXISTS llm_profile jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE neighborhood_profiles
  ADD COLUMN IF NOT EXISTS external_metrics jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE neighborhood_profiles
  ADD COLUMN IF NOT EXISTS data_sources jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE neighborhood_profiles
  DROP COLUMN IF EXISTS rentals;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS source_place_context jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS chat_messages jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_selected_neighborhood_id text;
