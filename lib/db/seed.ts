import { config } from "dotenv";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  cities,
  neighborhoods,
  places,
  reviews,
  users,
} from "@/lib/db/schema";
import { demoUser, seedCities } from "@/lib/db/seed-data";

config({ path: ".env.local" });
config({ path: ".env" });

function point(lng: number, lat: number) {
  return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });
  const db = drizzle(client);

  try {
    await db
      .insert(users)
      .values(demoUser)
      .onConflictDoUpdate({
        target: users.email,
        set: { name: demoUser.name },
      });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, demoUser.email))
      .limit(1);

    if (!user) {
      throw new Error("Failed to create demo user.");
    }

    for (const city of seedCities) {
      await db
        .insert(cities)
        .values({
          name: city.name,
          slug: city.slug,
          country: city.country,
        })
        .onConflictDoUpdate({
          target: cities.slug,
          set: {
            name: city.name,
            country: city.country,
          },
        });

      const [cityRow] = await db
        .select({ id: cities.id })
        .from(cities)
        .where(eq(cities.slug, city.slug))
        .limit(1);

      if (!cityRow) {
        throw new Error(`Failed to create city: ${city.name}`);
      }

      for (const neighborhood of city.neighborhoods) {
        await db
          .insert(neighborhoods)
          .values({
            cityId: cityRow.id,
            name: neighborhood.name,
            slug: neighborhood.slug,
            summary: neighborhood.summary,
            vibeTags: neighborhood.vibeTags,
            bestForTags: neighborhood.bestForTags,
            rentMin: neighborhood.rentMin,
            rentMax: neighborhood.rentMax,
            walkabilityScore: neighborhood.walkabilityScore,
            nightlifeScore: neighborhood.nightlifeScore,
            quietScore: neighborhood.quietScore,
            transitScore: neighborhood.transitScore,
            lat: neighborhood.lat,
            lng: neighborhood.lng,
            coordinates: point(neighborhood.lng, neighborhood.lat),
          })
          .onConflictDoUpdate({
            target: [neighborhoods.cityId, neighborhoods.slug],
            set: {
              name: neighborhood.name,
              summary: neighborhood.summary,
              vibeTags: neighborhood.vibeTags,
              bestForTags: neighborhood.bestForTags,
              rentMin: neighborhood.rentMin,
              rentMax: neighborhood.rentMax,
              walkabilityScore: neighborhood.walkabilityScore,
              nightlifeScore: neighborhood.nightlifeScore,
              quietScore: neighborhood.quietScore,
              transitScore: neighborhood.transitScore,
              lat: neighborhood.lat,
              lng: neighborhood.lng,
              coordinates: point(neighborhood.lng, neighborhood.lat),
            },
          });

        const [neighborhoodRow] = await db
          .select({ id: neighborhoods.id })
          .from(neighborhoods)
          .where(
            and(
              eq(neighborhoods.cityId, cityRow.id),
              eq(neighborhoods.slug, neighborhood.slug),
            ),
          )
          .limit(1);

        if (!neighborhoodRow) {
          throw new Error(`Failed to create neighborhood: ${neighborhood.name}`);
        }

        for (const place of neighborhood.places) {
          await db
            .insert(places)
            .values({
              neighborhoodId: neighborhoodRow.id,
              name: place.name,
              slug: place.slug,
              category: place.category,
              summary: place.summary,
              priceRange: place.priceRange,
              vibeTags: place.vibeTags,
              bestForTags: place.bestForTags,
              lat: place.lat,
              lng: place.lng,
              coordinates: point(place.lng, place.lat),
            })
            .onConflictDoUpdate({
              target: [places.neighborhoodId, places.slug],
              set: {
                name: place.name,
                category: place.category,
                summary: place.summary,
                priceRange: place.priceRange,
                vibeTags: place.vibeTags,
                bestForTags: place.bestForTags,
                lat: place.lat,
                lng: place.lng,
                coordinates: point(place.lng, place.lat),
              },
            });

          const [placeRow] = await db
            .select({ id: places.id })
            .from(places)
            .where(
              and(
                eq(places.neighborhoodId, neighborhoodRow.id),
                eq(places.slug, place.slug),
              ),
            )
            .limit(1);

          if (!placeRow) {
            throw new Error(`Failed to create place: ${place.name}`);
          }

          await db.delete(reviews).where(eq(reviews.placeId, placeRow.id));

          for (const review of place.reviews) {
            await db.insert(reviews).values({
              placeId: placeRow.id,
              userId: user.id,
              rating: review.rating,
              body: review.body,
              reviewerVibeTags: review.reviewerVibeTags,
              reviewerInterests: review.reviewerInterests,
            });
          }
        }
      }
    }

    console.log("Seed data loaded.");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
