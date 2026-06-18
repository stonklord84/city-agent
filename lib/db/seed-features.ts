// Seed data for neighborhood profile feature columns.
// All feature values are 0.0–1.0 floats (higher = more of that quality)

export type FeatureVector = {
  walkability:        number;
  transit:            number;
  nightlife:          number;
  safety:             number;
  cafes:              number;
  parks:              number;
  youngProfessionals: number;
  affordability:      number;
  diversity:          number;
};

// Keyed by neighborhood slug.
export const neighborhoodFeatureVectors: Record<string, FeatureVector> = {
  // Toronto
  "downtown-toronto": {
    walkability: 0.99, transit: 0.99, nightlife: 0.92, safety: 0.55,
    cafes: 0.85, parks: 0.40, youngProfessionals: 0.90, affordability: 0.28, diversity: 0.75,
  },
  "kensington-market": {
    walkability: 0.88, transit: 0.82, nightlife: 0.75, safety: 0.62,
    cafes: 0.92, parks: 0.55, youngProfessionals: 0.72, affordability: 0.68, diversity: 0.96,
  },
  "leslieville": {
    walkability: 0.82, transit: 0.72, nightlife: 0.65, safety: 0.75,
    cafes: 0.82, parks: 0.65, youngProfessionals: 0.78, affordability: 0.60, diversity: 0.70,
  },
  "north-york": {
    walkability: 0.65, transit: 0.75, nightlife: 0.40, safety: 0.80,
    cafes: 0.55, parks: 0.72, youngProfessionals: 0.60, affordability: 0.65, diversity: 0.82,
  },
  "scarborough": {
    walkability: 0.55, transit: 0.65, nightlife: 0.35, safety: 0.72,
    cafes: 0.45, parks: 0.74, youngProfessionals: 0.50, affordability: 0.80, diversity: 0.92,
  },
  "etobicoke": {
    walkability: 0.60, transit: 0.68, nightlife: 0.30, safety: 0.82,
    cafes: 0.45, parks: 0.80, youngProfessionals: 0.55, affordability: 0.72, diversity: 0.72,
  },
  "mississauga": {
    walkability: 0.50, transit: 0.70, nightlife: 0.40, safety: 0.80,
    cafes: 0.60, parks: 0.70, youngProfessionals: 0.65, affordability: 0.62, diversity: 0.85,
  },
  "markham": {
    walkability: 0.50, transit: 0.60, nightlife: 0.30, safety: 0.90,
    cafes: 0.55, parks: 0.75, youngProfessionals: 0.50, affordability: 0.58, diversity: 0.92,
  },
  "vaughan": {
    walkability: 0.50, transit: 0.80, nightlife: 0.40, safety: 0.85,
    cafes: 0.50, parks: 0.70, youngProfessionals: 0.60, affordability: 0.55, diversity: 0.75,
  },
  "richmond-hill": {
    walkability: 0.50, transit: 0.60, nightlife: 0.30, safety: 0.90,
    cafes: 0.55, parks: 0.80, youngProfessionals: 0.50, affordability: 0.52, diversity: 0.78,
  },
  "brampton": {
    walkability: 0.40, transit: 0.60, nightlife: 0.30, safety: 0.75,
    cafes: 0.45, parks: 0.70, youngProfessionals: 0.55, affordability: 0.75, diversity: 0.90,
  },

  // New York City
  "williamsburg": {
    walkability: 0.93, transit: 0.88, nightlife: 0.95, safety: 0.72,
    cafes: 0.95, parks: 0.65, youngProfessionals: 0.93, affordability: 0.22, diversity: 0.80,
  },
  "park-slope": {
    walkability: 0.90, transit: 0.85, nightlife: 0.60, safety: 0.85,
    cafes: 0.88, parks: 0.92, youngProfessionals: 0.78, affordability: 0.18, diversity: 0.72,
  },
  "upper-west-side": {
    walkability: 0.96, transit: 0.92, nightlife: 0.50, safety: 0.82,
    cafes: 0.84, parks: 0.95, youngProfessionals: 0.68, affordability: 0.15, diversity: 0.72,
  },
  "east-village": {
    walkability: 0.99, transit: 0.91, nightlife: 0.96, safety: 0.58,
    cafes: 0.92, parks: 0.55, youngProfessionals: 0.92, affordability: 0.18, diversity: 0.82,
  },
  "long-island-city": {
    walkability: 0.88, transit: 0.95, nightlife: 0.62, safety: 0.75,
    cafes: 0.78, parks: 0.72, youngProfessionals: 0.90, affordability: 0.24, diversity: 0.78,
  },
  "harlem": {
    walkability: 0.88, transit: 0.88, nightlife: 0.70, safety: 0.62,
    cafes: 0.72, parks: 0.76, youngProfessionals: 0.70, affordability: 0.48, diversity: 0.92,
  },
  "prospect-heights": {
    walkability: 0.92, transit: 0.86, nightlife: 0.65, safety: 0.78,
    cafes: 0.86, parks: 0.90, youngProfessionals: 0.82, affordability: 0.24, diversity: 0.76,
  },
  "astoria": {
    walkability: 0.85, transit: 0.83, nightlife: 0.72, safety: 0.78,
    cafes: 0.80, parks: 0.68, youngProfessionals: 0.75, affordability: 0.52, diversity: 0.93,
  },
  "bushwick": {
    walkability: 0.82, transit: 0.80, nightlife: 0.90, safety: 0.60,
    cafes: 0.85, parks: 0.55, youngProfessionals: 0.86, affordability: 0.55, diversity: 0.85,
  },
  "jackson-heights": {
    walkability: 0.88, transit: 0.85, nightlife: 0.65, safety: 0.72,
    cafes: 0.75, parks: 0.62, youngProfessionals: 0.60, affordability: 0.65, diversity: 0.99,
  },

  // Mumbai
  "bandra-west": {
    walkability: 0.72, transit: 0.78, nightlife: 0.88, safety: 0.75,
    cafes: 0.92, parks: 0.55, youngProfessionals: 0.93, affordability: 0.28, diversity: 0.80,
  },
  "andheri-west": {
    walkability: 0.65, transit: 0.83, nightlife: 0.72, safety: 0.70,
    cafes: 0.72, parks: 0.50, youngProfessionals: 0.80, affordability: 0.50, diversity: 0.78,
  },
  "powai": {
    walkability: 0.60, transit: 0.65, nightlife: 0.55, safety: 0.83,
    cafes: 0.68, parks: 0.72, youngProfessionals: 0.84, affordability: 0.42, diversity: 0.72,
  },
  "dadar": {
    walkability: 0.80, transit: 0.90, nightlife: 0.60, safety: 0.72,
    cafes: 0.65, parks: 0.60, youngProfessionals: 0.65, affordability: 0.62, diversity: 0.88,
  },
};
