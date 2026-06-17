import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { neighborhoods, places } from "@/lib/db/schema";

export async function getPlacesNearNeighborhood(
  neighborhoodId: string,
  radiusMeters = 800,
) {
  const [neighborhood] = await db
    .select({
      id: neighborhoods.id,
      coordinates: neighborhoods.coordinates,
    })
    .from(neighborhoods)
    .where(eq(neighborhoods.id, neighborhoodId))
    .limit(1);

  if (!neighborhood) {
    return [];
  }

  return db
    .select({
      id: places.id,
      name: places.name,
      category: places.category,
      priceRange: places.priceRange,
      distanceMeters: sql<number>`round(ST_Distance(${places.coordinates}, ${neighborhood.coordinates}))::int`,
    })
    .from(places)
    .where(
      and(
        eq(places.neighborhoodId, neighborhoodId),
        sql`ST_DWithin(${places.coordinates}, ${neighborhood.coordinates}, ${radiusMeters})`,
      ),
    )
    .orderBy(sql`ST_Distance(${places.coordinates}, ${neighborhood.coordinates})`);
}
