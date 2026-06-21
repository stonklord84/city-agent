import { relations, sql } from "drizzle-orm";
import {
  check,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const geographyPoint = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Point,4326)";
  },
});

export type NeighborhoodPlace = {
  name: string;
  category: "food" | "nightlife" | "wellness" | "practical";
  summary: string;
  priceRange?: string;
  vibeTags: string[];
  bestForTags: string[];
  lat?: number;
  lng?: number;
};

export type CommuteEstimate = {
  destination: string;
  minutes: number;
  mode: "walk" | "bike" | "transit" | "drive";
  notes?: string;
};

export type LlmNeighborhoodProfile = {
  summary?: string;
  vibeTags?: string[];
  bestForTags?: string[];
  featureNotes?: Record<string, string>;
  generatedBy?: string;
  generatedAt?: string;
};

export type ExternalMetrics = {
  zillowZoriCityRentUsd?: number;
  zillowZoriRegionName?: string;
  zillowZoriRegionType?: string;
  zillowZoriAsOf?: string;
  epaWalkabilityIndex?: number;
  epaIntersectionDensity?: number;
  epaTransitProximityMeters?: number;
  epaEmploymentMix?: number;
  epaEmploymentHousingMix?: number;
  epaBlockGroupGeoid?: string;
  epaWalkabilityMatchedAt?: string;
  streetEasy?: {
    url: string;
    borough: string;
    medianSaleLabel?: string;
    medianSaleUsd?: number;
    medianBaseRentUsd?: number;
    mood?: string;
    heart?: string;
    bestPerk?: string;
    biggestDownside?: string;
    foodDrinkNote?: string;
    similarNeighborhoods?: string[];
    sourceMode: "scraped" | "snapshot";
    fetchedAt: string;
  };
};

export type DataSources = Record<
  string,
  {
    name: string;
    url: string;
    fetchedAt: string;
    notes?: string;
  }
>;

export type SourcePlaceContext = {
  sourceNeighborhood?: string;
  sourceCity?: string;
  likes?: string;
  dislikes?: string;
  mobilityPreference?: string;
  weatherPreference?: string;
  nearbyPriorities?: string[];
  dailyLifeNotes?: string;
  intent?: string;
  lifestylePicks?: string[];
  tradeoffs?: string[];
  preferences?: Record<string, number>;
  generatedBy?: string;
  generatedAt?: string;
};

export type PersistedChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    country: text("country").notNull(),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("cities_slug_idx").on(table.slug),
  }),
);

export const neighborhoodProfiles = pgTable(
  "neighborhood_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    vibeTags: text("vibe_tags").array().notNull().default([]),
    bestForTags: text("best_for_tags").array().notNull().default([]),

    rentMin: integer("rent_min").notNull(),
    rentMax: integer("rent_max").notNull(),

    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    coordinates: geographyPoint("coordinates").notNull(),

    walkability: real("walkability").notNull().default(0.5),
    transit: real("transit").notNull().default(0.5),
    nightlife: real("nightlife").notNull().default(0.5),
    safety: real("safety").notNull().default(0.5),
    cafes: real("cafes").notNull().default(0.5),
    parks: real("parks").notNull().default(0.5),
    youngProfessionals: real("young_professionals").notNull().default(0.5),
    affordability: real("affordability").notNull().default(0.5),
    diversity: real("diversity").notNull().default(0.5),

    places: jsonb("places").$type<NeighborhoodPlace[]>().notNull().default([]),
    commuteEstimates: jsonb("commute_estimates")
      .$type<CommuteEstimate[]>()
      .notNull()
      .default([]),
    llmProfile: jsonb("llm_profile")
      .$type<LlmNeighborhoodProfile>()
      .notNull()
      .default({}),
    externalMetrics: jsonb("external_metrics")
      .$type<ExternalMetrics>()
      .notNull()
      .default({}),
    dataSources: jsonb("data_sources")
      .$type<DataSources>()
      .notNull()
      .default({}),

    dataSource: text("data_source").notNull().default("seeded"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    citySlugIdx: uniqueIndex("neighborhood_profiles_city_slug_idx").on(
      table.cityId,
      table.slug,
    ),
    rentCheck: check(
      "neighborhood_profiles_rent_check",
      sql`${table.rentMin} <= ${table.rentMax}`,
    ),
  }),
);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  authId: text("auth_id").notNull().default("demo-user"),
  cityId: uuid("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "restrict" }),

  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  sourceNeighborhoodName: text("source_neighborhood_name"),
  sourceCityName: text("source_city_name"),
  sourceLikes: text("source_likes"),
  sourceDislikes: text("source_dislikes"),

  walkabilityWeight: real("walkability_weight").notNull().default(0.5),
  transitWeight: real("transit_weight").notNull().default(0.5),
  nightlifeWeight: real("nightlife_weight").notNull().default(0.5),
  safetyWeight: real("safety_weight").notNull().default(0.5),
  cafesWeight: real("cafes_weight").notNull().default(0.5),
  parksWeight: real("parks_weight").notNull().default(0.5),
  youngProfessionalsWeight: real("young_professionals_weight")
    .notNull()
    .default(0.5),
  affordabilityWeight: real("affordability_weight").notNull().default(0.5),
  diversityWeight: real("diversity_weight").notNull().default(0.5),

  matchedNeighborhoods: jsonb("matched_neighborhoods")
    .$type<
      Array<{
        neighborhoodProfileId: string;
        score: number;
        reasons: string[];
      }>
    >()
    .notNull()
    .default([]),
  sourcePlaceContext: jsonb("source_place_context")
    .$type<SourcePlaceContext>()
    .notNull()
    .default({}),
  chatMessages: jsonb("chat_messages")
    .$type<PersistedChatMessage[]>()
    .notNull()
    .default([]),
  lastSelectedNeighborhoodId: text("last_selected_neighborhood_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const apiResponseCache = pgTable(
  "api_response_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    operation: text("operation").notNull(),
    model: text("model").notNull(),
    cacheKey: text("cache_key").notNull().unique(),
    requestPayload: jsonb("request_payload").notNull(),
    responsePayload: jsonb("response_payload")
      .$type<{ content: string }>()
      .notNull(),
    hitCount: integer("hit_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    cacheKeyIdx: uniqueIndex("api_response_cache_cache_key_idx").on(
      table.cacheKey,
    ),
    providerOperationIdx: index("api_response_cache_provider_operation_idx").on(
      table.provider,
      table.operation,
    ),
  }),
);

export const citiesRelations = relations(cities, ({ many }) => ({
  neighborhoodProfiles: many(neighborhoodProfiles),
  userProfiles: many(userProfiles),
}));

export const neighborhoodProfilesRelations = relations(
  neighborhoodProfiles,
  ({ one }) => ({
    city: one(cities, {
      fields: [neighborhoodProfiles.cityId],
      references: [cities.id],
    }),
  }),
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  city: one(cities, {
    fields: [userProfiles.cityId],
    references: [cities.id],
  }),
}));

export type City = typeof cities.$inferSelect;
export type NeighborhoodProfile = typeof neighborhoodProfiles.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type ApiResponseCache = typeof apiResponseCache.$inferSelect;
