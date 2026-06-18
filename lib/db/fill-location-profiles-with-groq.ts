import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";

import {
  cities,
  neighborhoodProfiles,
  type CommuteEstimate,
  type LlmNeighborhoodProfile,
} from "@/lib/db/schema-minimal";
import { createGroqChatCompletion, GROQ_MODEL } from "@/lib/ai/groq";

const FEATURE_KEYS = [
  "walkability",
  "transit",
  "nightlife",
  "safety",
  "cafes",
  "parks",
  "youngProfessionals",
  "affordability",
  "diversity",
] as const;

type GroqNeighborhoodFill = {
  summary?: string;
  vibeTags?: string[];
  bestForTags?: string[];
  featureNotes?: Record<string, string>;
  commuteEstimates?: CommuteEstimate[];
};

function parseJsonObject(content: string): GroqNeighborhoodFill {
  const trimmed = content.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Groq did not return a JSON object: ${content}`);
  }

  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as GroqNeighborhoodFill;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned.slice(0, 8) : fallback;
}

function asCommuteEstimates(value: unknown): CommuteEstimate[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is CommuteEstimate => {
      return (
        item &&
        typeof item === "object" &&
        "destination" in item &&
        "minutes" in item &&
        "mode" in item
      );
    })
    .map((item) => ({
      destination: String(item.destination).slice(0, 80),
      minutes: Math.max(1, Math.min(180, Math.round(Number(item.minutes)))),
      mode: ["walk", "bike", "transit", "drive"].includes(item.mode)
        ? item.mode
        : "transit",
      notes: item.notes ? String(item.notes).slice(0, 180) : undefined,
    }))
    .slice(0, 4);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    const rows = await db
      .select({
        cityName: cities.name,
        cityCountry: cities.country,
        neighborhood: neighborhoodProfiles,
      })
      .from(neighborhoodProfiles)
      .innerJoin(cities, eq(neighborhoodProfiles.cityId, cities.id));

    console.log(
      `Groq profile fill starting for ${rows.length} neighborhoods using ${GROQ_MODEL}.`,
    );

    for (const row of rows) {
      const profile = row.neighborhood;
      if (profile.dataSource.includes("groq")) {
        console.log(`Skipping already filled ${row.cityName} / ${profile.name}`);
        continue;
      }
      const featureVector = Object.fromEntries(
        FEATURE_KEYS.map((key) => [key, profile[key]]),
      );

      const content = await createGroqChatCompletion([
        {
          role: "system",
          content:
            "You enrich neighborhood rows for a relocation app. Return only compact JSON. Do not invent exact listings, places, or commute times. Base the answer on the supplied row, city, feature scores, tags, and places.",
        },
        {
          role: "user",
          content: JSON.stringify({
            requiredShape: {
              summary: "one warm, specific sentence",
              vibeTags: ["3-6 short tags"],
              bestForTags: ["3-6 short user-fit tags"],
              featureNotes: {
                walkability: "short reason",
                transit: "short reason",
                nightlife: "short reason",
                safety: "short reason",
                cafes: "short reason",
                parks: "short reason",
                youngProfessionals: "short reason",
                affordability: "short reason",
                diversity: "short reason",
              },
              commuteEstimates: [
                {
                  destination: "simple neighborhood-to-neighborhood or city-core destination",
                  minutes: 25,
                  mode: "transit",
                  notes: "brief estimate note",
                },
              ],
            },
            city: {
              name: row.cityName,
              country: row.cityCountry,
            },
            neighborhood: {
              name: profile.name,
              summary: profile.summary,
              vibeTags: profile.vibeTags,
              bestForTags: profile.bestForTags,
              rentMin: profile.rentMin,
              rentMax: profile.rentMax,
              featureVector,
              places: profile.places.slice(0, 12),
            },
          }),
        },
      ]);

      const fill = parseJsonObject(content);
      const generatedAt = new Date().toISOString();
      const llmProfile: LlmNeighborhoodProfile = {
        summary: fill.summary,
        vibeTags: asStringArray(fill.vibeTags, profile.vibeTags),
        bestForTags: asStringArray(fill.bestForTags, profile.bestForTags),
        featureNotes:
          fill.featureNotes && typeof fill.featureNotes === "object"
            ? fill.featureNotes
            : {},
        generatedBy: GROQ_MODEL,
        generatedAt,
      };

      await db
        .update(neighborhoodProfiles)
        .set({
          summary: fill.summary?.trim() || profile.summary,
          vibeTags: llmProfile.vibeTags ?? profile.vibeTags,
          bestForTags: llmProfile.bestForTags ?? profile.bestForTags,
          commuteEstimates: asCommuteEstimates(fill.commuteEstimates),
          llmProfile,
          dataSource: profile.dataSource.includes("groq")
            ? profile.dataSource
            : `${profile.dataSource}+groq`,
          updatedAt: sql`now()`,
        })
        .where(eq(neighborhoodProfiles.id, profile.id));

      console.log(`Filled ${row.cityName} / ${profile.name}`);
      await sleep(6000);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
