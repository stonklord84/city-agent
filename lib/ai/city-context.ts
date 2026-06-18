import { and, asc, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  cities,
  neighborhoodFeatures,
  neighborhoods,
  places,
  rentals,
} from "@/lib/db/schema";

export type CityContextRequest = {
  citySlug: string;
  neighborhoodIds?: string[];
  neighborhoodSlugs?: string[];
  placeLimitPerNeighborhood?: number;
  rentalLimitPerNeighborhood?: number;
};

export type CityContextNeighborhood = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  vibeTags: string[];
  bestForTags: string[];
  rentMin: number;
  rentMax: number;
  lat: number;
  lng: number;
  features: {
    walkability: number;
    transit: number;
    nightlife: number;
    safety: number;
    cafes: number;
    parks: number;
    youngProfessionals: number;
    affordability: number;
    diversity: number;
  };
  places: Array<{
    id: string;
    name: string;
    category: string;
    summary: string;
    priceRange: string;
    vibeTags: string[];
    bestForTags: string[];
    distanceMeters: number | null;
  }>;
  rentals: Array<{
    id: string;
    title: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    source: string;
    externalUrl: string;
  }>;
};

export type CityContext = {
  city: {
    id: string;
    name: string;
    slug: string;
    country: string;
    currency: string;
  };
  neighborhoods: CityContextNeighborhood[];
};

const DEFAULT_PLACE_LIMIT = 8;
const DEFAULT_RENTAL_LIMIT = 4;

export async function getCityContext({
  citySlug,
  neighborhoodIds = [],
  neighborhoodSlugs = [],
  placeLimitPerNeighborhood = DEFAULT_PLACE_LIMIT,
  rentalLimitPerNeighborhood = DEFAULT_RENTAL_LIMIT,
}: CityContextRequest): Promise<CityContext | null> {
  const [city] = await db
    .select({
      id: cities.id,
      name: cities.name,
      slug: cities.slug,
      country: cities.country,
      currency: cities.currency,
    })
    .from(cities)
    .where(eq(cities.slug, citySlug))
    .limit(1);

  if (!city) {
    return null;
  }

  const filters = [eq(neighborhoods.cityId, city.id)];
  const hasIds = neighborhoodIds.length > 0;
  const hasSlugs = neighborhoodSlugs.length > 0;

  if (hasIds && hasSlugs) {
    filters.push(
      or(
        inArray(neighborhoods.id, neighborhoodIds),
        inArray(neighborhoods.slug, neighborhoodSlugs),
      )!,
    );
  } else if (hasIds) {
    filters.push(inArray(neighborhoods.id, neighborhoodIds));
  } else if (hasSlugs) {
    filters.push(inArray(neighborhoods.slug, neighborhoodSlugs));
  }

  const rows = await db
    .select({
      neighborhood: neighborhoods,
      features: neighborhoodFeatures,
    })
    .from(neighborhoods)
    .innerJoin(
      neighborhoodFeatures,
      eq(neighborhoods.id, neighborhoodFeatures.neighborhoodId),
    )
    .where(and(...filters))
    .orderBy(asc(neighborhoods.name));

  const contextNeighborhoods: CityContextNeighborhood[] = [];

  for (const row of rows) {
    const nearbyPlaces = await db
      .select({
        id: places.id,
        name: places.name,
        category: places.category,
        summary: places.summary,
        priceRange: places.priceRange,
        vibeTags: places.vibeTags,
        bestForTags: places.bestForTags,
        distanceMeters: sql<number>`round(ST_Distance(${places.coordinates}, ${row.neighborhood.coordinates}))::int`,
      })
      .from(places)
      .where(eq(places.neighborhoodId, row.neighborhood.id))
      .orderBy(sql`ST_Distance(${places.coordinates}, ${row.neighborhood.coordinates})`)
      .limit(placeLimitPerNeighborhood);

    const rentalRows = await db
      .select({
        id: rentals.id,
        title: rentals.title,
        price: rentals.price,
        currency: rentals.currency,
        bedrooms: rentals.bedrooms,
        bathrooms: rentals.bathrooms,
        source: rentals.source,
        externalUrl: rentals.externalUrl,
      })
      .from(rentals)
      .where(eq(rentals.neighborhoodId, row.neighborhood.id))
      .orderBy(asc(rentals.price))
      .limit(rentalLimitPerNeighborhood);

    contextNeighborhoods.push({
      id: row.neighborhood.id,
      name: row.neighborhood.name,
      slug: row.neighborhood.slug,
      summary: row.neighborhood.summary,
      vibeTags: row.neighborhood.vibeTags,
      bestForTags: row.neighborhood.bestForTags,
      rentMin: row.neighborhood.rentMin,
      rentMax: row.neighborhood.rentMax,
      lat: row.neighborhood.lat,
      lng: row.neighborhood.lng,
      features: {
        walkability: row.features.walkability,
        transit: row.features.transit,
        nightlife: row.features.nightlife,
        safety: row.features.safety,
        cafes: row.features.cafes,
        parks: row.features.parks,
        youngProfessionals: row.features.youngProfessionals,
        affordability: row.features.affordability,
        diversity: row.features.diversity,
      },
      places: nearbyPlaces,
      rentals: rentalRows,
    });
  }

  return {
    city,
    neighborhoods: contextNeighborhoods,
  };
}

export function cityContextToPrompt(context: CityContext): string {
  return JSON.stringify(
    {
      city: context.city,
      neighborhoods: context.neighborhoods.map((neighborhood) => ({
        name: neighborhood.name,
        summary: neighborhood.summary,
        vibeTags: neighborhood.vibeTags,
        bestForTags: neighborhood.bestForTags,
        rentRange: {
          min: neighborhood.rentMin,
          max: neighborhood.rentMax,
          currency: context.city.currency,
        },
        features: neighborhood.features,
        places: neighborhood.places.map((place) => ({
          name: place.name,
          category: place.category,
          summary: place.summary,
          priceRange: place.priceRange,
          vibeTags: place.vibeTags,
          bestForTags: place.bestForTags,
          distanceMeters: place.distanceMeters,
        })),
        rentals: neighborhood.rentals.map((rental) => ({
          title: rental.title,
          price: rental.price,
          currency: rental.currency,
          bedrooms: rental.bedrooms,
          bathrooms: rental.bathrooms,
          source: rental.source,
        })),
      })),
    },
    null,
    2,
  );
}
