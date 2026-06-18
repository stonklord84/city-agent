import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { neighborhoodProfiles } from "@/lib/db/schema-minimal";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const neighborhoodId = searchParams.get("neighborhoodId");

  if (!neighborhoodId) {
    return NextResponse.json(
      { error: "Missing required query parameter: neighborhoodId" },
      { status: 400 }
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
        { status: 404 }
      );
    }

    const list = [...profile.rentals]
      .sort((a, b) => a.price - b.price)
      .map((rental, index) => ({
        id: `${profile.id}-rental-${index}`,
        neighborhoodId: profile.id,
        bedrooms: 0,
        bathrooms: 1,
        source: "seeded",
        externalUrl: "#",
        ...rental,
      }));

    return NextResponse.json({
      data: list,
    });
  } catch (error) {
    console.error("Rentals fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rentals." },
      { status: 500 }
    );
  }
}
