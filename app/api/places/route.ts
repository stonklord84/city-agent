import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { neighborhoods, places } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const neighborhoodId = searchParams.get("neighborhoodId");
  const limitParam = searchParams.get("limit");
  const parsedLimit = Number(limitParam ?? 12);
  const limit = Number.isFinite(parsedLimit)
    ? Math.trunc(Math.min(Math.max(parsedLimit, 1), 30))
    : 12;

  if (!neighborhoodId) {
    return NextResponse.json(
      { error: "Missing required query parameter: neighborhoodId" },
      { status: 400 },
    );
  }

  try {
    const [neighborhood] = await db
      .select({
        id: neighborhoods.id,
        coordinates: neighborhoods.coordinates,
      })
      .from(neighborhoods)
      .where(eq(neighborhoods.id, neighborhoodId))
      .limit(1);

    if (!neighborhood) {
      return NextResponse.json(
        { error: "Neighborhood not found." },
        { status: 404 },
      );
    }

    const list = await db
      .select({
        id: places.id,
        name: places.name,
        slug: places.slug,
        category: places.category,
        summary: places.summary,
        priceRange: places.priceRange,
        vibeTags: places.vibeTags,
        bestForTags: places.bestForTags,
        lat: places.lat,
        lng: places.lng,
        distanceMeters: sql<number>`round(ST_Distance(${places.coordinates}, ${neighborhood.coordinates}))::int`,
      })
      .from(places)
      .where(eq(places.neighborhoodId, neighborhoodId))
      .orderBy(sql`ST_Distance(${places.coordinates}, ${neighborhood.coordinates})`)
      .limit(limit);

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Places fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch places." },
      { status: 500 },
    );
  }
}
