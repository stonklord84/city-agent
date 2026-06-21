import { and, asc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { cities, neighborhoodProfiles } from "@/lib/db/schema";

export type CityContextRequest = {
  citySlug: string;
  neighborhoodIds?: string[];
  neighborhoodSlugs?: string[];
  placeLimitPerNeighborhood?: number;
};

export type CityContextNeighborhood = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  vibeTags: string[];
  bestForTags: string[];
  llmProfile: unknown;
  commuteEstimates: unknown;
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
  externalMetrics: {
    streetEasy?: {
      medianBaseRentUsd?: number;
      mood?: string;
      heart?: string;
      bestPerk?: string;
      biggestDownside?: string;
      foodDrinkNote?: string;
    };
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
export async function getCityContext({
  citySlug,
  neighborhoodIds = [],
  neighborhoodSlugs = [],
  placeLimitPerNeighborhood = DEFAULT_PLACE_LIMIT,
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
      llmProfile: profile.llmProfile,
      commuteEstimates: profile.commuteEstimates,
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
      externalMetrics: {
        streetEasy: profile.externalMetrics.streetEasy
          ? {
              medianBaseRentUsd:
                profile.externalMetrics.streetEasy.medianBaseRentUsd,
              mood: profile.externalMetrics.streetEasy.mood,
              heart: profile.externalMetrics.streetEasy.heart,
              bestPerk: profile.externalMetrics.streetEasy.bestPerk,
              biggestDownside:
                profile.externalMetrics.streetEasy.biggestDownside,
              foodDrinkNote: profile.externalMetrics.streetEasy.foodDrinkNote,
            }
          : undefined,
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
        llmProfile: neighborhood.llmProfile,
        commuteEstimates: neighborhood.commuteEstimates,
        rentRange: {
          min: neighborhood.rentMin,
          max: neighborhood.rentMax,
          currency: context.city.currency,
        },
        features: neighborhood.features,
        streetEasy: neighborhood.externalMetrics.streetEasy,
        places: neighborhood.places.map((place) => ({
          name: place.name,
          category: place.category,
          summary: place.summary,
          priceRange: place.priceRange,
          vibeTags: place.vibeTags,
          bestForTags: place.bestForTags,
          distanceMeters: place.distanceMeters,
        })),
      })),
    },
    null,
    2,
  );
}
