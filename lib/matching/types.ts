export interface MatchResult {
  neighborhoodId: string;
  neighborhoodName: string;
  neighborhoodSlug: string;
  cityName: string;
  score: number; // 0 - 100
  reasons: string[];
  scoreBreakdown: {
    similarity: number; // 0 - 100
    budgetFit: number; // 0 - 100
    llmAdjustment?: number;
  };
  llmCalibration?: {
    scoreDelta: number;
    reason: string;
  };
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
  rentMin: number;
  rentMax: number;
  lat: number;
  lng: number;
  summary: string;
  vibeTags: string[];
  bestForTags: string[];
  externalMetrics?: {
    zillowZoriCityRentUsd?: number;
    zillowZoriRegionName?: string;
    zillowZoriRegionType?: string;
    zillowZoriAsOf?: string;
    epaWalkabilityIndex?: number;
    epaIntersectionDensity?: number;
    epaTransitProximityMeters?: number;
    epaEmploymentMix?: number;
    epaEmploymentHousingMix?: number;
    epaBlockGroupGeoid?: string;
    epaWalkabilityMatchedAt?: string;
    streetEasy?: {
      url: string;
      borough: string;
      medianSaleLabel?: string;
      medianSaleUsd?: number;
      medianBaseRentUsd?: number;
      mood?: string;
      heart?: string;
      bestPerk?: string;
      biggestDownside?: string;
      foodDrinkNote?: string;
      similarNeighborhoods?: string[];
      sourceMode: "scraped" | "snapshot";
      fetchedAt: string;
    };
  };
  dataSources?: Record<
    string,
    {
      name: string;
      url: string;
      fetchedAt: string;
      notes?: string;
    }
  >;
}
