import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { neighborhoodProfiles } from "@/lib/db/schema-minimal";

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
    const [profile] = await db
      .select()
      .from(neighborhoodProfiles)
      .where(eq(neighborhoodProfiles.id, neighborhoodId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Neighborhood profile not found." },
        { status: 404 },
      );
    }

    const list = profile.places.slice(0, limit).map((place, index) => ({
      id: `${profile.id}-place-${index}`,
      neighborhoodId: profile.id,
      slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      priceRange: "$$",
      distanceMeters: null,
      ...place,
    }));

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Places fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch places." },
      { status: 500 },
    );
  }
}
