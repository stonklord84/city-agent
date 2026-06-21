import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { neighborhoodProfiles, cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { scoreNeighborhoods } from "@/lib/matching/score";
import { PreferenceVector } from "@/lib/ai/extract-preferences";
import { calibrateMatchesWithLlama } from "@/lib/ai/calibrate-matches";

export const runtime = "nodejs";

interface MatchRequestBody {
  preferences: PreferenceVector;
  budgetMin: number;
  budgetMax: number;
  citySlug: string;
  source?: {
    sourceNeighborhood?: string;
    likes?: string;
    mobilityPreference?: string;
    nearbyPriorities?: string[];
    dailyLifeNotes?: string;
    lifestylePicks?: string[];
    tradeoffs?: string[];
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchRequestBody;
    const { preferences, budgetMin, budgetMax, citySlug, source } = body;

    if (!preferences || typeof budgetMin !== "number" || typeof budgetMax !== "number" || !citySlug) {
      return NextResponse.json(
        { error: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    // 1. Fetch destination city
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.slug, citySlug))
      .limit(1);

    if (!city) {
      return NextResponse.json(
        { error: `Destination city '${citySlug}' not found.` },
        { status: 404 }
      );
    }

    // 2. Fetch neighborhood profiles in the target city
    const profiles = await db
      .select()
      .from(neighborhoodProfiles)
      .where(eq(neighborhoodProfiles.cityId, city.id));

    // Map into the format expected by scoreNeighborhoods
    const neighborhoodsWithFeatures = profiles.map((profile) => ({
      neighborhood: profile,
      features: profile,
      city: city,
    }));

    // 3. Compute matching scores
    const deterministicMatches = scoreNeighborhoods(
      preferences,
      budgetMin,
      budgetMax,
      neighborhoodsWithFeatures
    );
    let matches = deterministicMatches;

    try {
      matches = await calibrateMatchesWithLlama({
        source,
        preferences,
        budgetMin,
        budgetMax,
        matches: deterministicMatches,
      });
    } catch (error) {
      console.warn("Llama match calibration failed; using deterministic matches.", error);
    }

    return NextResponse.json({
      data: {
        city,
        matches,
      },
    });
  } catch (error) {
    console.error("Match route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Neighborhood matching failed." },
      { status: 500 }
    );
  }
}
