export type TomTomPoiCategory =
  | "food"
  | "nightlife"
  | "wellness"
  | "practical";

export type TomTomPoi = {
  name: string;
  category: TomTomPoiCategory;
  summary: string;
  priceRange: string;
  vibeTags: string[];
  bestForTags: string[];
  lat?: number;
  lng?: number;
};

type TomTomSearchResult = {
  poi?: {
    name?: string;
    categories?: string[];
  };
  address?: {
    freeformAddress?: string;
  };
  position?: {
    lat?: number;
    lon?: number;
  };
};

type TomTomSearchResponse = {
  results?: TomTomSearchResult[];
};

const TOMTOM_SEARCH_URL = "https://api.tomtom.com/search/2/search";

const SEARCH_QUERIES: Array<{
  query: string;
  category: TomTomPoiCategory;
  vibeTags: string[];
  bestForTags: string[];
}> = [
  {
    query: "coffee cafe",
    category: "food",
    vibeTags: ["coffee", "local"],
    bestForTags: ["cafes", "remote work", "casual meetups"],
  },
  {
    query: "restaurant",
    category: "food",
    vibeTags: ["food", "local"],
    bestForTags: ["restaurants", "weekend meals"],
  },
  {
    query: "bar nightlife",
    category: "nightlife",
    vibeTags: ["social", "nightlife"],
    bestForTags: ["drinks", "date nights", "going out"],
  },
  {
    query: "park gym",
    category: "wellness",
    vibeTags: ["wellness", "active"],
    bestForTags: ["parks", "fitness", "outdoor time"],
  },
  {
    query: "grocery pharmacy",
    category: "practical",
    vibeTags: ["practical", "daily life"],
    bestForTags: ["errands", "groceries", "newcomer basics"],
  },
];

function getTomTomKey() {
  return process.env.TOMTOM_API_KEY?.trim();
}

async function fetchTomTomSearch(params: {
  query: string;
  lat: number;
  lng: number;
  countrySet: string;
  radiusMeters?: number;
  limit?: number;
}) {
  const key = getTomTomKey();
  if (!key) {
    return [];
  }

  const searchParams = new URLSearchParams({
    key,
    idxSet: "POI",
    countrySet: params.countrySet,
    lat: String(params.lat),
    lon: String(params.lng),
    radius: String(params.radiusMeters ?? 1600),
    limit: String(params.limit ?? 8),
  });

  const url = `${TOMTOM_SEARCH_URL}/${encodeURIComponent(params.query)}.json?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`TomTom search failed: ${response.status} ${details}`);
  }

  const payload = (await response.json()) as TomTomSearchResponse;
  return payload.results ?? [];
}

export async function getTomTomNeighborhoodPois(params: {
  lat: number;
  lng: number;
  countrySet: string;
}) {
  const places: TomTomPoi[] = [];
  const seen = new Set<string>();

  for (const search of SEARCH_QUERIES) {
    const results = await fetchTomTomSearch({
      query: search.query,
      lat: params.lat,
      lng: params.lng,
      countrySet: params.countrySet,
    });

    for (const result of results) {
      const name = result.poi?.name?.trim();
      if (!name) {
        continue;
      }

      const key = name.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const poiCategories = result.poi?.categories?.join(", ");
      const address = result.address?.freeformAddress;

      places.push({
        name,
        category: search.category,
        summary: [poiCategories, address].filter(Boolean).join(" near "),
        priceRange: "$$",
        vibeTags: search.vibeTags,
        bestForTags: search.bestForTags,
        lat: result.position?.lat,
        lng: result.position?.lon,
      });
    }
  }

  return places;
}

export function hasTomTomKey() {
  return Boolean(getTomTomKey());
}
