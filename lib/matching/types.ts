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
}
