/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client"; 
import { neighborhoodProfiles } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import neighborhoodData from "@/lib/db/neighborhood_profiles.json";

export const maxDuration = 60; 

export async function POST() {
  try {
    const rawData = neighborhoodData as any[];
    
    const processed = rawData.map((n) => {
      // 1. Skip if the record doesn't provide a city reference at all
      if (!n.city_id) return null;

      const parsedLat = Number(n.lat || 0);
      const parsedLng = Number(n.lng || 0);
      const minRent = Math.floor(Number(n.rent_min || 0));
      let maxRent = Math.floor(Number(n.rent_max || 0));
      if (maxRent < minRent) maxRent = minRent;

      // 2. Direct 1:1 mapping straight from the JSON file to your database structure
      return {
        id: n.id || undefined, 
        cityId: n.city_id, // Safely maps directly to your aligned Aurora city IDs
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

    // 3. Batch insert everything in chunks of 50
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