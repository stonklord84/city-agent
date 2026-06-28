import { NextResponse } from "next/server";
import { db } from "@/lib/db/client"; 
import { neighborhoodProfiles, userProfiles, apiResponseCache } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// Imports the JSON files straight from your lib/db folder
import neighborhoodData from "@/lib/db/neighborhood_profiles.json";
import userData from "@/lib/db/user_profiles.json";
import cacheData from "@/lib/db/api_response_cache.json";

export async function POST() {
  console.log("🌱 Starting safe database sync...");

  try {
    // 2. SAFE INSERT FOR NEIGHBORHOOD PROFILES
    if (neighborhoodData && neighborhoodData.length > 0) {
      console.log(`⏳ Syncing ${neighborhoodData.length} neighborhood profiles...`);
      
      const processed = neighborhoodData.map((n: any) => ({
        ...n,
        // Wraps the string correctly so PostGIS turns it into raw coordinates
        coordinates: sql`ST_GeographyFromText(${n.coordinates || `POINT(${n.lng} ${n.lat})`})`,
      }));
      
      // onConflictDoNothing stops duplicate-key crashes and preserves existing rows
      await db.insert(neighborhoodProfiles).values(processed as any).onConflictDoNothing();
    }

    // // 4. SAFE INSERT FOR API CACHE
    // if (cacheData && cacheData.length > 0) {
    //   console.log(`⏳ Syncing ${cacheData.length} cache rows...`);
    //   await db.insert(apiResponseCache).values(cacheData as any).onConflictDoNothing();
    // }

    console.log("✅ Everything successfully synchronized!");
    return NextResponse.json({ success: true, message: "Synchronization complete" });

  } catch (error: any) {
    console.error("❌ Sync failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || String(error) }, 
      { status: 500 }
    );
  }
}