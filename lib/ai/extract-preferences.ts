import { createGroqChatCompletion, GROQ_MODEL } from "@/lib/ai/groq";

export const preferenceKeys = [
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

export type PreferenceKey = (typeof preferenceKeys)[number];
export type PreferenceVector = Record<PreferenceKey, number>;

export type PreferenceExtractionInput = {
  sourceNeighborhood: string;
  sourceCity?: string;
  destinationCity?: string;
  likes: string;
  dislikes?: string;
  mobilityPreference?: string;
  nearbyPriorities?: string[];
  dailyLifeNotes?: string;
  lifestylePicks?: string[];
  tradeoffs?: string[];
};

export type PreferenceExtractionResult = {
  preferences: PreferenceVector;
  model: string;
  fallback: boolean;
  raw?: string;
};

export const neutralPreferenceVector: PreferenceVector = {
  walkability: 0.5,
  transit: 0.5,
  nightlife: 0.5,
  safety: 0.5,
  cafes: 0.5,
  parks: 0.5,
  young_professionals: 0.5,
  affordability: 0.5,
  diversity: 0.5,
};

function clampPreference(value: unknown) {
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  if (!Number.isFinite(numberValue)) {
    return 0.5;
  }

  return Math.min(1, Math.max(0, numberValue));
}

function extractJsonObject(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in Llama response.");
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

export function parsePreferenceVector(raw: string): PreferenceVector {
  const parsed = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;

  return preferenceKeys.reduce((preferences, key) => {
    preferences[key] = clampPreference(parsed[key]);
    return preferences;
  }, { ...neutralPreferenceVector });
}

function buildExtractionPrompt(input: PreferenceExtractionInput) {
  return `Source neighborhood: ${input.sourceNeighborhood}
Source city: ${input.sourceCity || "Not provided"}
Destination city: ${input.destinationCity || "Not provided"}

What the user loves:
${input.likes}

Lifestyle cues they selected:
${input.lifestylePicks?.length ? input.lifestylePicks.join(", ") : "Not provided"}

How the user likes to get around:
${input.mobilityPreference || "Not provided"}

What they want close by:
${input.nearbyPriorities?.length ? input.nearbyPriorities.join(", ") : "Not provided"}

Daily life and exploration notes:
${input.dailyLifeNotes || "Not provided"}

Tradeoffs the user accepts:
${input.tradeoffs?.length ? input.tradeoffs.join(", ") : "Not provided"}

What the user would change:
${input.dislikes || "The user did not provide dislikes. Infer mostly from what they liked and keep uncertain dimensions neutral."}`;
}

export async function extractPreferences(
  input: PreferenceExtractionInput,
): Promise<PreferenceExtractionResult> {
  const raw = await createGroqChatCompletion([
    {
      role: "system",
      content: [
        "You extract relocation lifestyle preferences for Polaris.",
        "Return only a JSON object with exactly these numeric keys:",
        preferenceKeys.join(", "),
        "Each value must be a number from 0.0 to 1.0.",
        "Use the source neighborhood/city as semantic context only.",
        "If the source place is unfamiliar, rely on the user's likes.",
        "If dislikes are missing, keep uncertain dimensions close to 0.5.",
        "Do not recommend, rank, or mention destination neighborhoods.",
      ].join(" "),
    },
    {
      role: "user",
      content: buildExtractionPrompt(input),
    },
  ]);

  try {
    return {
      preferences: parsePreferenceVector(raw),
      model: GROQ_MODEL,
      fallback: false,
      raw,
    };
  } catch {
    return {
      preferences: neutralPreferenceVector,
      model: GROQ_MODEL,
      fallback: true,
      raw,
    };
  }
}
