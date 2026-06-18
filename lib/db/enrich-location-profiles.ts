import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

import { getTomTomNeighborhoodPois, hasTomTomKey } from "@/lib/enrichment/tomtom";
import { neighborhoodFeatureVectors } from "@/lib/db/seed-features";
import { seedCities, type SeedNeighborhood } from "@/lib/db/seed-data";
import {
  cities,
  neighborhoodProfiles,
  type NeighborhoodPlace,
} from "@/lib/db/schema-minimal";

const COUNTRY_SET_BY_COUNTRY: Record<string, string> = {
  Canada: "CA",
  India: "IN",
  "United States": "US",
  USA: "US",
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  Canada: "USD",
  India: "USD",
  "United States": "USD",
  USA: "USD",
};

function point(lng: number, lat: number) {
  return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
}

function normalizeScore(score: number) {
  return Math.min(1, Math.max(0, score / 100));
}

function mapSeedPlaces(neighborhood: SeedNeighborhood): NeighborhoodPlace[] {
  return neighborhood.places.map((place) => ({
    name: place.name,
    category: place.category,
    summary: place.summary,
    priceRange: place.priceRange,
    vibeTags: place.vibeTags,
    bestForTags: place.bestForTags,
    lat: place.lat,
    lng: place.lng,
  }));
}

function mergePlaces(
  seededPlaces: NeighborhoodPlace[],
  apiPlaces: NeighborhoodPlace[],
) {
  const places: NeighborhoodPlace[] = [];
  const seen = new Set<string>();

  for (const place of [...seededPlaces, ...apiPlaces]) {
    const key = place.name.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    places.push(place);
  }

  return places.slice(0, 24);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(client);
  const tomTomEnabled = hasTomTomKey();

  console.log(
    `Location enrichment starting. Database: Neon via DATABASE_URL. TomTom: ${tomTomEnabled ? "on" : "off"}`,
  );

  try {
    for (const city of seedCities) {
      const countrySet = COUNTRY_SET_BY_COUNTRY[city.country];
      const currency = CURRENCY_BY_COUNTRY[city.country] ?? "USD";

      const [cityRow] = await db
        .insert(cities)
        .values({
          name: city.name,
          slug: city.slug,
          country: city.country,
          currency,
        })
        .onConflictDoUpdate({
          target: cities.slug,
          set: {
            name: city.name,
            country: city.country,
            currency,
          },
        })
        .returning({ id: cities.id });

      for (const neighborhood of city.neighborhoods) {
        const featureVector = neighborhoodFeatureVectors[neighborhood.slug];

        const apiPlaces =
          tomTomEnabled && countrySet
            ? await getTomTomNeighborhoodPois({
                lat: neighborhood.lat,
                lng: neighborhood.lng,
                countrySet,
              })
            : [];

        const places = mergePlaces(mapSeedPlaces(neighborhood), apiPlaces);
        const walkability =
          featureVector?.walkability ?? normalizeScore(neighborhood.walkabilityScore);
        const transit =
          featureVector?.transit ?? normalizeScore(neighborhood.transitScore);
        const nightlife =
          featureVector?.nightlife ?? normalizeScore(neighborhood.nightlifeScore);
        const safety =
          featureVector?.safety ?? normalizeScore(neighborhood.quietScore);
        const cafes = featureVector?.cafes ?? 0.5;
        const parks = featureVector?.parks ?? 0.5;
        const youngProfessionals = featureVector?.youngProfessionals ?? 0.5;
        const affordability = featureVector?.affordability ?? 0.5;
        const diversity = featureVector?.diversity ?? 0.5;
        const dataSource = tomTomEnabled ? "seeded+tomtom" : "seeded";

        await db
          .insert(neighborhoodProfiles)
          .values({
            cityId: cityRow.id,
            name: neighborhood.name,
            slug: neighborhood.slug,
            summary: neighborhood.summary,
            vibeTags: neighborhood.vibeTags,
            bestForTags: neighborhood.bestForTags,
            rentMin: neighborhood.rentMin,
            rentMax: neighborhood.rentMax,
            lat: neighborhood.lat,
            lng: neighborhood.lng,
            coordinates: point(neighborhood.lng, neighborhood.lat),
            walkability,
            transit,
            nightlife,
            safety,
            cafes,
            parks,
            youngProfessionals,
            affordability,
            diversity,
            places,
            commuteEstimates: [],
            dataSource,
          })
          .onConflictDoUpdate({
            target: [
              neighborhoodProfiles.cityId,
              neighborhoodProfiles.slug,
            ],
            set: {
              summary: neighborhood.summary,
              vibeTags: neighborhood.vibeTags,
              bestForTags: neighborhood.bestForTags,
              rentMin: neighborhood.rentMin,
              rentMax: neighborhood.rentMax,
              lat: neighborhood.lat,
              lng: neighborhood.lng,
              coordinates: point(neighborhood.lng, neighborhood.lat),
              walkability,
              transit,
              nightlife,
              safety,
              cafes,
              parks,
              youngProfessionals,
              affordability,
              diversity,
              places,
              dataSource,
              updatedAt: sql`now()`,
            },
          });

        console.log(
          `Saved ${city.name} / ${neighborhood.name}: ${places.length} places`,
        );
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
