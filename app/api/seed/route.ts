import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cities, neighborhoodProfiles } from "@/lib/db/schema-minimal";
import { seedCities } from "@/lib/db/seed-data";
import { eq } from "drizzle-orm";

export async function POST() {
  console.log("🌱 Starting database seeding...");

  for (const cityData of seedCities) {
    console.log(`Inserting city: ${cityData.name}`);

    const [insertedCity] = await db
      .insert(cities)
      .values({
        name: cityData.name,
        slug: cityData.slug,
        country: cityData.country,
        currency: "USD",
      })
      .onConflictDoNothing()
      .returning({ id: cities.id });

    let cityId = insertedCity?.id;

    if (!cityId) {
      const existing = await db
        .select({ id: cities.id })
        .from(cities)
        .where(eq(cities.slug, cityData.slug));

      cityId = existing[0]?.id;
    }

    if (
      cityId &&
      cityData.neighborhoods &&
      cityData.neighborhoods.length > 0
    ) {
      const profilesToInsert = cityData.neighborhoods.map((n) => ({
        cityId,

        name: n.name,
        slug: n.slug,

        summary: n.summary,

        vibeTags: n.vibeTags || [],
        bestForTags: n.bestForTags || [],

        rentMin: n.rentMin,
        rentMax: n.rentMax,

        lat: n.lat,
        lng: n.lng,

        coordinates: `POINT(${n.lng} ${n.lat})`,

        walkability:
          n.walkabilityScore !== undefined
            ? n.walkabilityScore / 100
            : 0.5,

        transit:
          n.transitScore !== undefined
            ? n.transitScore / 100
            : 0.5,

        nightlife:
          n.nightlifeScore !== undefined
            ? n.nightlifeScore / 100
            : 0.5,

        safety: 0.5,
        cafes: 0.5,
        parks: 0.5,
        youngProfessionals: 0.5,
        affordability: 0.5,
        diversity: 0.5,

        places: (n.places || []).map((p) => ({
          name: p.name,
          category: p.category,
          summary: p.summary,
          priceRange: p.priceRange,

          vibeTags: p.vibeTags || [],
          bestForTags: p.bestForTags || [],

          lat: p.lat,
          lng: p.lng,
        })),

        commuteEstimates: [],
        llmProfile: {},

        dataSource: "seeded",
      }));

      await db
        .insert(neighborhoodProfiles)
        .values(profilesToInsert)
        .onConflictDoNothing();
    }
  }

  return NextResponse.json({
    success: true,
  });
}