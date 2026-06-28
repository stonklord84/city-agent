import { NextResponse } from "next/server";
import { db } from "@/lib/db/client"; 
import { neighborhoodProfiles, cities } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import neighborhoodData from "@/lib/db/neighborhood_profiles.json";

// Force this route to allow up to 60 seconds execution if you are on a Vercel Pro plan
// (Leave it in anyway, it helps hint to Vercel's infrastructure)
export const maxDuration = 60; 

export async function POST() {
  console.log("🌱 Starting clean, batch-optimized database sync...");

  try {
    const dbCities = await db.select().from(cities);
    
    const liveCityLookup = dbCities.reduce((acc, c) => {
      acc[c.name.toLowerCase().trim()] = c.id;
      acc[c.slug.toLowerCase().trim()] = c.id;
      return acc;
    }, {} as Record<string, string>);

    const cityAliasMap: Record<string, string> = {
      "new-york": "new york city",
      "new_york": "new york city",
      "nyc": "new york city",
      "ny": "new york city"
    };

    const rawData = neighborhoodData as any[];
    
    const processed = rawData.map((n) => {
      const rawCityIdentifier = (n.city_slug || n.city || n.city_name || "").toLowerCase().trim();
      const resolvedKey = cityAliasMap[rawCityIdentifier] || rawCityIdentifier;
      const realCityId = liveCityLookup[resolvedKey];

      if (!realCityId) {
        return null;
      }

      const parsedLat = Number(n.lat || 0);
      const parsedLng = Number(n.lng || 0);

      return {
        id: n.id || undefined, 
        cityId: realCityId,
        name: n.name,
        slug: n.slug.toLowerCase().trim(),
        summary: n.summary || "",
        vibeTags: n.vibe_tags || [],
        bestForTags: n.best_for_tags || [],
        rentMin: Math.floor(Number(n.rent_min || 0)),
        rentMax: Math.floor(Number(n.rent_max || 0)),
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
        coordinates: sql`ST_GeographyFromText(${n.coordinates || `POINT(${parsedLng} ${parsedLat})`})`,
      };
    }).filter(Boolean);

    if (processed.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No compatible records found." });
    }

    // BREAK INTO BATCHES OF 50 TO PREVENT VERCEL TIMEOUTS
    const chunkSize = 50;
    let insertedCount = 0;

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
      
      insertedCount += chunk.length;
      console.log(`⏳ Progress: Synced ${insertedCount}/${processed.length} rows...`);
    }

    console.log(`✅ Sync complete. Successfully processed ${processed.length} entries.`);
    return NextResponse.json({ success: true, count: processed.length });

  } catch (error: any) {
    console.error("❌ Sync failed:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}