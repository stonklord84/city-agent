/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client"; 
import { neighborhoodProfiles, cities } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import neighborhoodData from "@/lib/db/neighborhood_profiles.json";

export const maxDuration = 60; 

export async function POST() {
  try {
    // 1. Fetch live cities to find whatever UUIDs your database currently holds
    const dbCities = await db.select().from(cities);
    
    // Map existing records dynamically by their slug matching the launch set
    const torontoUuid = dbCities.find(c => c.slug.includes("toronto"))?.id;
    const mumbaiUuid = dbCities.find(c => c.slug.includes("mumbai"))?.id;
    const nycUuid = dbCities.find(c => c.slug.includes("nyc") || c.slug.includes("new-york"))?.id;

    const rawData = neighborhoodData as any[];
    
    const processed = rawData.map((n) => {
      // 2. Identify target city matching the JSON entry's tracking ID
      const incomingCityId = n.city_id;
      let realCityId = null;

      // Fallback fallback: Check parent city context clues from the file to resolve ID mismatches
      if (incomingCityId === "ee2cafe6-491a-449f-9da8-ece7fbf60b59") {
        realCityId = nycUuid;
      } else if (n.city_slug?.includes("toronto") || n.city?.includes("toronto")) {
        realCityId = torontoUuid;
      } else if (n.city_slug?.includes("mumbai") || n.city?.includes("mumbai")) {
        realCityId = mumbaiUuid;
      } else {
        realCityId = nycUuid; // Fallback catch-all for remaining regional inputs
      }

      if (!realCityId) return null;

      const parsedLat = Number(n.lat || 0);
      const parsedLng = Number(n.lng || 0);
      const minRent = Math.floor(Number(n.rent_min || 0));
      let maxRent = Math.floor(Number(n.rent_max || 0));
      if (maxRent < minRent) maxRent = minRent;

      return {
        id: n.id || undefined, 
        cityId: realCityId,
        name: n.name,
        slug: n.slug.toLowerCase().trim(),
        summary: n.summary || "",
        vibeTags: n.vibe_tags || [],
        bestForTags: n.best_for_tags || [],
        rentMin: minRent,
        rentMax: maxRent,
        lat: parsedLat,
        lng: parsedLng,
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
        coordinates: sql`ST_GeographyFromText(${`POINT(${parsedLng} ${parsedLat})`})`,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (processed.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const chunkSize = 50;
    for (let i = 0; i < processed.length; i += chunkSize) {
      const chunk = processed.slice(i, i + chunkSize);
      
      await db
        .insert(neighborhoodProfiles)
        .values(chunk as any)
        .onConflictDoUpdate({
          target: [neighborhoodProfiles.cityId, neighborhoodProfiles.slug],
          set: {
            name: sql`EXCLUDED.name`,
            summary: sql`EXCLUDED.summary`,
            rentMin: sql`EXCLUDED.rent_min`,
            rentMax: sql`EXCLUDED.rent_max`,
            coordinates: sql`EXCLUDED.coordinates`,
            places: sql`EXCLUDED.places`,
            updatedAt: sql`now()`,
          },
        });
    }

    return NextResponse.json({ success: true, count: processed.length });

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}