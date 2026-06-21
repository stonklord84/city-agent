import { NextResponse } from "next/server";

import {
  extractPreferences,
  type PreferenceExtractionInput,
} from "@/lib/ai/extract-preferences";

export const runtime = "nodejs";

type ExtractPreferencesRequest = Partial<
  PreferenceExtractionInput & {
    sourceNeighborhoodName: string;
    sourceCityName: string;
    destinationCitySlug: string;
  }
>;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function parseRequestBody(body: ExtractPreferencesRequest) {
  const sourceNeighborhood =
    readString(body.sourceNeighborhood) ||
    readString(body.sourceNeighborhoodName);
  const sourceCity =
    readString(body.sourceCity) || readString(body.sourceCityName);
  const destinationCity =
    readString(body.destinationCity) || readString(body.destinationCitySlug);
  const likes = readString(body.likes);
  const dislikes = readString(body.dislikes);
  const mobilityPreference = readString(body.mobilityPreference);
  const nearbyPriorities = readStringArray(body.nearbyPriorities);
  const dailyLifeNotes = readString(body.dailyLifeNotes);
  const lifestylePicks = readStringArray(body.lifestylePicks);
  const tradeoffs = readStringArray(body.tradeoffs);

  const missing = [
    ["sourceNeighborhood", sourceNeighborhood],
    ["likes", likes],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return {
      error: `Missing required field(s): ${missing.join(", ")}`,
    };
  }

  return {
    data: {
      sourceNeighborhood,
      sourceCity,
      destinationCity,
      likes,
      dislikes,
      mobilityPreference,
      nearbyPriorities,
      dailyLifeNotes,
      lifestylePicks,
      tradeoffs,
    } satisfies PreferenceExtractionInput,
  };
}

export async function POST(request: Request) {
  let body: ExtractPreferencesRequest;

  try {
    body = (await request.json()) as ExtractPreferencesRequest;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = parseRequestBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await extractPreferences(parsed.data);

    return NextResponse.json({
      data: {
        source: parsed.data,
        preferences: result.preferences,
        model: result.model,
        fallback: result.fallback,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Preference extraction failed.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
