import { NextResponse } from "next/server";

import { getCityContext } from "@/lib/ai/city-context";
import { createGroqChatCompletion } from "@/lib/ai/groq";
import type { PreferenceVector } from "@/lib/ai/extract-preferences";
import type { MatchResult } from "@/lib/matching/types";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  citySlug: string;
  message: string;
  messages?: ChatMessage[];
  preferences?: PreferenceVector;
  matches?: MatchResult[];
  selectedNeighborhoodId?: string;
  sourceContext?: {
    sourceNeighborhood?: string;
    sourceCity?: string;
    likes?: string;
    dislikes?: string;
    mobilityPreference?: string;
    weatherPreference?: string;
    nearbyPriorities?: string[];
    dailyLifeNotes?: string;
  };
};

function parseChatMessage(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown };
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    // Fall through to a safe generic message below.
  }

  return "I can help compare these neighborhoods using the data we have, but I could not format that answer cleanly.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const {
      citySlug,
      message,
      messages = [],
      preferences,
      matches = [],
      selectedNeighborhoodId,
      sourceContext,
    } = body;

    if (!citySlug || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: citySlug and message." },
        { status: 400 },
      );
    }

    const topMatches = matches.slice(0, 3);
    const neighborhoodIds = selectedNeighborhoodId
      ? [
          selectedNeighborhoodId,
          ...topMatches
            .map((match) => match.neighborhoodId)
            .filter((id) => id !== selectedNeighborhoodId),
        ]
      : topMatches.map((match) => match.neighborhoodId);

    const context = await getCityContext({
      citySlug,
      neighborhoodIds,
      placeLimitPerNeighborhood: 3,
    });

    if (!context) {
      return NextResponse.json(
        { error: `Destination city '${citySlug}' not found.` },
        { status: 404 },
      );
    }

    const raw = await createGroqChatCompletion([
      {
        role: "system",
        content: [
          "You are Polaris, a warm local relocation guide.",
          "Answer using only the provided database context, match results, and user preferences.",
          "Do not invent neighborhoods, places, rent ranges, commute times, or listings.",
          "Do not rank neighborhoods yourself. If comparing options, refer to the deterministic match scores provided by the app.",
          "Keep answers concise and specific. Return only JSON with one string key: message.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            currentQuestion: message,
            recentMessages: messages.slice(-3).map((chatMessage) => ({
              role: chatMessage.role,
              content: chatMessage.content.slice(0, 240),
            })),
            sourceContext: sourceContext
              ? {
                  sourceNeighborhood: sourceContext.sourceNeighborhood,
                  sourceCity: sourceContext.sourceCity,
                  likes: sourceContext.likes?.slice(0, 300),
                  mobilityPreference: sourceContext.mobilityPreference,
                  weatherPreference: sourceContext.weatherPreference,
                  nearbyPriorities: sourceContext.nearbyPriorities?.slice(0, 6),
                  dailyLifeNotes: sourceContext.dailyLifeNotes?.slice(0, 260),
                }
              : undefined,
            userPreferences: preferences,
            deterministicMatches: topMatches.map((match) => ({
              neighborhoodName: match.neighborhoodName,
              score: match.score,
              reasons: match.reasons.slice(0, 2),
              rentMin: match.rentMin,
              rentMax: match.rentMax,
            })),
            selectedNeighborhoodId,
            databaseContext: {
              city: context.city,
              neighborhoods: context.neighborhoods.map((neighborhood) => ({
                id: neighborhood.id,
                name: neighborhood.name,
                summary: neighborhood.summary.slice(0, 220),
                rentMin: neighborhood.rentMin,
                rentMax: neighborhood.rentMax,
                vibeTags: neighborhood.vibeTags.slice(0, 4),
                bestForTags: neighborhood.bestForTags.slice(0, 4),
                features: neighborhood.features,
                streetEasy: neighborhood.externalMetrics.streetEasy,
                places: neighborhood.places.slice(0, 3).map((place) => ({
                  name: place.name,
                  category: place.category,
                  summary: place.summary.slice(0, 120),
                })),
              })),
            },
          },
        ),
      },
    ]);

    return NextResponse.json({
      data: {
        message: parseChatMessage(raw),
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed." },
      { status: 500 },
    );
  }
}
