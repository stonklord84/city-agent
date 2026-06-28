import { NextResponse } from "next/server";
import { db } from "@/lib/db/client"; 
import { neighborhoodProfiles, cities } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import neighborhoodData from "@/lib/db/neighborhood_profiles.json";

interface NeighborhoodInput {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  summary: string;
  vibe_tags?: string[];
  best_for_tags?: string[];
  rent_min: number;
  rent_max: number;
  lat: number;
  lng: number;
  coordinates?: string;
  walkability?: number;
  transit?: number;
  nightlife?: number;
  safety?: number;
  cafes?: number;
  parks?: number;
  young_professionals?: number;
  affordability?: number;
  diversity?: number;
  places?: unknown;
  commute_estimates?: unknown;
  llm_profile?: unknown;
  external_metrics?: unknown;
  data_sources?: unknown;
  data_source?: string;
}

export async function POST() {
  console.log("🌱 Starting safe database sync...");

  try {
    // 1. Fetch real city IDs currently assigned in your live database
    const dbCities = await db.select().from(cities);
    
    // Map them into a slug lookup map (e.g., { "toronto": "real-uuid-abc", "new-york": "real-uuid-xyz" })
    const cityLookup = dbCities.reduce((acc, c) => {
      acc[c.slug.toLowerCase()] = c.id;
      return acc;
    }, {} as Record<string, string>);

    // Typecast the JSON array to use our interface format safely
    const typedData = neighborhoodData as NeighborhoodInput[];
    console.log(`⏳ Mapping and parsing ${typedData.length} entries...`);

    const processed = typedData.map((n: NeighborhoodInput) => {
      // Determine target city by analyzing the hardcoded context
      let citySlug = "toronto";
      const normalizedSummary = (n.summary || "").toLowerCase();
      const normalizedSlug = (n.slug || "").toLowerCase();

      if (normalizedSlug.includes("ny") || normalizedSummary.includes("new york") || n.name === "Jersey City") {
        citySlug = "new-york";
      } else if (normalizedSlug.includes("mumbai") || normalizedSummary.includes("mumbai")) {
        citySlug = "mumbai";
      }

      // Fetch the real live foreign key from Aurora
      const realCityId = cityLookup[citySlug];
      if (!realCityId) {
        throw new Error(`Database is missing a city record for slug: ${citySlug}`);
      }

      return {
        id: n.id,
        cityId: realCityId, // Drizzle expects camelCase for schema insertion values
        name: n.name,
        slug: n.slug,
        summary: n.summary,
        vibeTags: n.vibe_tags || [],
        bestForTags: n.best_for_tags || [],
        rentMin: Number(n.rent_min),
        rentMax: Number(n.rent_max),
        lat: Number(n.lat),
        lng: Number(n.lng),
        walkability: n.walkability ?? 0.5,
        transit: n.transit ?? 0.5,
        nightlife: n.nightlife ?? 0.5,
        safety: n.safety ?? 0.5,
        cafes: n.cafes ?? 0.5,
        parks: n.parks ?? 0.5,
        youngProfessionals: n.young_professionals ?? 0.5,
        affordability: n.affordability ?? 0.5,
        diversity: n.diversity ?? 0.5,
        places: n.places ? JSON.stringify(n.places) : "[]",
        commuteEstimates: n.commute_estimates ? JSON.stringify(n.commute_estimates) : "[]",
        llmProfile: n.llm_profile ? JSON.stringify(n.llm_profile) : "{}",
        externalMetrics: n.external_metrics ? JSON.stringify(n.external_metrics) : "{}",
        dataSources: n.data_sources ? JSON.stringify(n.data_sources) : "{}",
        dataSource: n.data_source || "seeded",
        coordinates: sql`ST_GeographyFromText(${n.coordinates || `POINT(${n.lng} ${n.lat})`})`,
      };
    });

    // 2. Perform upsert statement using Drizzle camelCase schema keys
    await db
      .insert(neighborhoodProfiles)
      .values(processed as unknown as typeof neighborhoodProfiles.$inferInsert[])
      .onConflictDoUpdate({
        target: [neighborhoodProfiles.id],
        set: {
          cityId: sql`EXCLUDED.city_id`,
          name: sql`EXCLUDED.name`,
          slug: sql`EXCLUDED.slug`,
          summary: sql`EXCLUDED.summary`,
          rentMin: sql`EXCLUDED.rent_min`,
          rentMax: sql`EXCLUDED.rent_max`,
          coordinates: sql`EXCLUDED.coordinates`,
          places: sql`EXCLUDED.places`,
          updatedAt: sql`now()`,
        },
      });

    console.log("✅ Database successfully synced!");
    return NextResponse.json({ success: true, count: processed.length });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Sync failed:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}