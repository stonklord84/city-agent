import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { cities, userProfiles } from "@/lib/db/schema";

const FEATURE_KEYS = [
  "walkability",
  "transit",
  "nightlife",
  "safety",
  "cafes",
  "parks",
  "young_professionals",
  "affordability",
  "diversity",
] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];

type UserProfilePayload = {
  profileId?: string;
  authId?: string;
  citySlug?: string;
  budgetMin?: number;
  budgetMax?: number;
  source?: {
    sourceNeighborhood?: string;
    sourceCity?: string;
    likes?: string;
    dislikes?: string;
    mobilityPreference?: string;
    weatherPreference?: string;
    nearbyPriorities?: string[];
    dailyLifeNotes?: string;
    intent?: string;
    lifestylePicks?: string[];
    tradeoffs?: string[];
  };
  preferences?: Partial<Record<FeatureKey, number>>;
  matchedNeighborhoods?: Array<{
    neighborhoodProfileId: string;
    score: number;
    reasons: string[];
  }>;
  chatMessages?: Array<{
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
  }>;
  lastSelectedNeighborhoodId?: string | null;
};

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readPreference(
  preferences: UserProfilePayload["preferences"],
  key: FeatureKey,
) {
  return Math.min(1, Math.max(0, readNumber(preferences?.[key], 0.5)));
}

function normalizeChatMessages(messages: UserProfilePayload["chatMessages"]) {
  const now = new Date().toISOString();

  return (messages ?? [])
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-30)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
      createdAt: message.createdAt || now,
    }));
}

async function getCityId(citySlug: string) {
  const [city] = await db
    .select({ id: cities.id })
    .from(cities)
    .where(eq(cities.slug, citySlug))
    .limit(1);

  return city?.id;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required." },
        { status: 400 },
      );
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, profileId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user profile." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UserProfilePayload;
    const citySlug = body.citySlug ?? "nyc";
    const cityId = await getCityId(citySlug);

    if (!cityId) {
      return NextResponse.json(
        { error: `City not found for slug: ${citySlug}` },
        { status: 404 },
      );
    }

    const source = body.source ?? {};
    const preferences = body.preferences ?? {};
    const generatedAt = new Date().toISOString();

    const [profile] = await db
      .insert(userProfiles)
      .values({
        authId: body.authId ?? "demo-user",
        cityId,
        budgetMin: Math.round(readNumber(body.budgetMin, 1500)),
        budgetMax: Math.round(readNumber(body.budgetMax, 4500)),
        sourceNeighborhoodName: source.sourceNeighborhood ?? "",
        sourceCityName: source.sourceCity ?? "",
        sourceLikes: source.likes ?? "",
        sourceDislikes: source.dislikes ?? "",
        walkabilityWeight: readPreference(preferences, "walkability"),
        transitWeight: readPreference(preferences, "transit"),
        nightlifeWeight: readPreference(preferences, "nightlife"),
        safetyWeight: readPreference(preferences, "safety"),
        cafesWeight: readPreference(preferences, "cafes"),
        parksWeight: readPreference(preferences, "parks"),
        youngProfessionalsWeight: readPreference(
          preferences,
          "young_professionals",
        ),
        affordabilityWeight: readPreference(preferences, "affordability"),
        diversityWeight: readPreference(preferences, "diversity"),
        matchedNeighborhoods: body.matchedNeighborhoods ?? [],
        chatMessages: normalizeChatMessages(body.chatMessages),
        lastSelectedNeighborhoodId: body.lastSelectedNeighborhoodId ?? null,
        sourcePlaceContext: {
          sourceNeighborhood: source.sourceNeighborhood ?? "",
          sourceCity: source.sourceCity ?? "",
          likes: source.likes ?? "",
          dislikes: source.dislikes ?? "",
          mobilityPreference: source.mobilityPreference ?? "",
          weatherPreference: source.weatherPreference ?? "",
          nearbyPriorities: Array.isArray(source.nearbyPriorities)
            ? source.nearbyPriorities
            : [],
          dailyLifeNotes: source.dailyLifeNotes ?? "",
          intent: source.intent ?? "",
          lifestylePicks: Array.isArray(source.lifestylePicks)
            ? source.lifestylePicks
            : [],
          tradeoffs: Array.isArray(source.tradeoffs) ? source.tradeoffs : [],
          preferences: Object.fromEntries(
            FEATURE_KEYS.map((key) => [key, readPreference(preferences, key)]),
          ),
          generatedBy: "llama",
          generatedAt,
        },
      })
      .returning({ id: userProfiles.id });

    return NextResponse.json({ data: { profileId: profile.id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save user profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UserProfilePayload;

    if (!body.profileId) {
      return NextResponse.json(
        { error: "profileId is required." },
        { status: 400 },
      );
    }

    const updates: Partial<typeof userProfiles.$inferInsert> = {
      updatedAt: sql`now()` as unknown as Date,
    };

    if (body.matchedNeighborhoods) {
      updates.matchedNeighborhoods = body.matchedNeighborhoods;
    }

    if (body.chatMessages) {
      updates.chatMessages = normalizeChatMessages(body.chatMessages);
    }

    if ("lastSelectedNeighborhoodId" in body) {
      updates.lastSelectedNeighborhoodId = body.lastSelectedNeighborhoodId ?? null;
    }

    await db
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, body.profileId));

    return NextResponse.json({ data: { profileId: body.profileId } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user profile." },
      { status: 500 },
    );
  }
}
