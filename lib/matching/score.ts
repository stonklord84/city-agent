import { PreferenceVector, PreferenceKey } from "@/lib/ai/extract-preferences";
import { City, NeighborhoodProfile } from "@/lib/db/schema";
import { MatchResult } from "./types";

type ProfileFeatureKey =
  | "walkability"
  | "transit"
  | "nightlife"
  | "safety"
  | "cafes"
  | "parks"
  | "youngProfessionals"
  | "affordability"
  | "diversity";

const FEATURE_KEY_MAP: Record<PreferenceKey, ProfileFeatureKey> = {
  walkability: "walkability",
  transit: "transit",
  nightlife: "nightlife",
  safety: "safety",
  cafes: "cafes",
  parks: "parks",
  young_professionals: "youngProfessionals",
  affordability: "affordability",
  diversity: "diversity",
};

const FEATURE_LABELS: Record<ProfileFeatureKey, string> = {
  walkability: "Highly walkable streets",
  transit: "Excellent public transit",
  nightlife: "Vibrant nightlife and dining",
  safety: "Very safe and quiet streets",
  cafes: "Thriving cafe and coffee culture",
  parks: "Beautiful parks and green spaces",
  youngProfessionals: "Popular with young professionals",
  affordability: "Great rental affordability",
  diversity: "Rich cultural diversity",
};

// Pure cosine similarity between two vectors. Kept for reference and tests, but
// runtime scoring uses weighted feature closeness because cosine is too generous
// when most lifestyle vectors are positive.
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>,
  keys: string[]
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    const a = vecA[key] ?? 0.5;
    const b = vecB[key] ?? 0.5;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0.5;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function weightedFeatureCloseness(
  userPrefs: PreferenceVector,
  dbVector: Record<string, number>,
  keys: string[],
): number {
  let weightedTotal = 0;
  let weightSum = 0;

  for (const key of keys) {
    const userValue = userPrefs[key as PreferenceKey] ?? 0.5;
    const dbValue = dbVector[key] ?? 0.5;
    const importance = 0.65 + Math.abs(userValue - 0.5) * 1.4;
    const closeness = 1 - Math.abs(userValue - dbValue);

    weightedTotal += Math.max(0, closeness) * importance;
    weightSum += importance;
  }

  if (weightSum === 0) return 0.5;
  return weightedTotal / weightSum;
}

// Calculates how well the neighborhood's rent range fits the user's budget
export function calculateBudgetFit(
  userMin: number,
  userMax: number,
  rentMin: number,
  rentMax: number
): number {
  if (userMax < rentMin) {
    return 0.0; // Completely out of budget
  }

  // If user budget covers the lower tier but not all, give partial score
  if (userMax >= rentMin && userMax <= rentMax) {
    const neighborhoodRange = rentMax - rentMin;
    if (neighborhoodRange <= 0) return 1.0;
    const overlap = userMax - rentMin;
    return Math.max(0.2, overlap / neighborhoodRange);
  }

  // If user max budget is above neighborhood max rent, it's fully affordable
  if (userMax >= rentMax) {
    return 1.0;
  }

  return 0.5;
}

function calibrateSimilarity(similarity: number) {
  const floor = 0.72;
  const calibrated = (similarity - floor) / (1 - floor);
  return Math.min(1, Math.max(0, calibrated));
}

// Generate the top 3 natural language reasons for the match
export function generateMatchReasons(
  userPrefs: PreferenceVector,
  features: NeighborhoodProfile
): string[] {
  const contributions: { key: ProfileFeatureKey; value: number }[] = [];

  for (const [userKey, dbKey] of Object.entries(FEATURE_KEY_MAP)) {
    const userVal = userPrefs[userKey as PreferenceKey] ?? 0.5;
    const dbVal = (features[dbKey] as number) ?? 0.5;
    contributions.push({ key: dbKey, value: userVal * dbVal });
  }

  // Sort descending by product
  contributions.sort((a, b) => b.value - a.value);

  // Take top 3 non-empty labels
  return contributions
    .slice(0, 3)
    .map((c) => FEATURE_LABELS[c.key])
    .filter(Boolean);
}

// Primary scoring function
export function scoreNeighborhoods(
  userPrefs: PreferenceVector,
  budgetMin: number,
  budgetMax: number,
  neighborhoodsWithFeatures: Array<{
    neighborhood: NeighborhoodProfile;
    features: NeighborhoodProfile;
    city: City;
  }>
): MatchResult[] {
  const keys = Object.keys(FEATURE_KEY_MAP);

  const results = neighborhoodsWithFeatures.map(({ neighborhood, features, city }) => {
    // 1. Calculate similarity score
    const dbVector: Record<string, number> = {};
    for (const [userKey, dbKey] of Object.entries(FEATURE_KEY_MAP)) {
      dbVector[userKey] = (features[dbKey] as number) ?? 0.5;
    }

    const similarity = weightedFeatureCloseness(userPrefs, dbVector, keys);

    // 2. Calculate budget fit score
    const budgetFit = calculateBudgetFit(
      budgetMin,
      budgetMax,
      neighborhood.rentMin,
      neighborhood.rentMax
    );

    // 3. Blend scores. Cosine similarity is generous with positive vectors,
    // so remap it to a stricter curve before combining with budget fit.
    const calibratedSimilarity = calibrateSimilarity(similarity);
    const rawScore = calibratedSimilarity * 0.7 + budgetFit * 0.3;
    const score = Math.round(rawScore * 100);

    // 4. Generate top reasons
    const reasons = generateMatchReasons(userPrefs, features);

    return {
      neighborhoodId: neighborhood.id,
      neighborhoodName: neighborhood.name,
      neighborhoodSlug: neighborhood.slug,
      cityName: city.name,
      score,
      reasons,
      scoreBreakdown: {
        similarity: Math.round(calibratedSimilarity * 100),
        budgetFit: Math.round(budgetFit * 100),
      },
      features: {
        walkability: features.walkability,
        transit: features.transit,
        nightlife: features.nightlife,
        safety: features.safety,
        cafes: features.cafes,
        parks: features.parks,
        youngProfessionals: features.youngProfessionals,
        affordability: features.affordability,
        diversity: features.diversity,
      },
      rentMin: neighborhood.rentMin,
      rentMax: neighborhood.rentMax,
      lat: neighborhood.lat,
      lng: neighborhood.lng,
      summary: neighborhood.summary,
      vibeTags: neighborhood.vibeTags,
      bestForTags: neighborhood.bestForTags,
      externalMetrics: neighborhood.externalMetrics,
      dataSources: neighborhood.dataSources,
    } as MatchResult;
  });

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}
