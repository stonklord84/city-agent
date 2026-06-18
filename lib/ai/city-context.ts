import { and, asc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { cities, neighborhoodProfiles } from "@/lib/db/schema-minimal";

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

  const filters = [eq(neighborhoodProfiles.cityId, city.id)];
  const hasIds = neighborhoodIds.length > 0;
  const hasSlugs = neighborhoodSlugs.length > 0;

  if (hasIds && hasSlugs) {
    filters.push(
      or(
        inArray(neighborhoodProfiles.id, neighborhoodIds),
        inArray(neighborhoodProfiles.slug, neighborhoodSlugs),
      )!,
    );
  } else if (hasIds) {
    filters.push(inArray(neighborhoodProfiles.id, neighborhoodIds));
  } else if (hasSlugs) {
    filters.push(inArray(neighborhoodProfiles.slug, neighborhoodSlugs));
  }

  const profiles = await db
    .select()
    .from(neighborhoodProfiles)
    .where(and(...filters))
    .orderBy(asc(neighborhoodProfiles.name));

  return {
    city,
    neighborhoods: profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      slug: profile.slug,
      summary: profile.summary,
      vibeTags: profile.vibeTags,
      bestForTags: profile.bestForTags,
      rentMin: profile.rentMin,
      rentMax: profile.rentMax,
      lat: profile.lat,
      lng: profile.lng,
      features: {
        walkability: profile.walkability,
        transit: profile.transit,
        nightlife: profile.nightlife,
        safety: profile.safety,
        cafes: profile.cafes,
        parks: profile.parks,
        youngProfessionals: profile.youngProfessionals,
        affordability: profile.affordability,
        diversity: profile.diversity,
      },
      places: profile.places.slice(0, placeLimitPerNeighborhood).map((place, index) => ({
        id: `${profile.id}-place-${index}`,
        name: place.name,
        category: place.category,
        summary: place.summary,
        priceRange: place.priceRange ?? "$$",
        vibeTags: place.vibeTags,
        bestForTags: place.bestForTags,
        distanceMeters: null,
      })),
      rentals: profile.rentals.slice(0, rentalLimitPerNeighborhood).map((rental, index) => ({
        id: `${profile.id}-rental-${index}`,
        title: rental.title,
        price: rental.price,
        currency: rental.currency,
        bedrooms: rental.bedrooms ?? 0,
        bathrooms: rental.bathrooms ?? 1,
        source: rental.source ?? "seeded",
        externalUrl: rental.externalUrl ?? "#",
      })),
    })),
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
