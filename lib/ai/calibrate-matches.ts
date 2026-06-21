import { createGroqChatCompletion } from "@/lib/ai/groq";
import type { PreferenceVector } from "@/lib/ai/extract-preferences";
import type { MatchResult } from "@/lib/matching/types";

type MatchCalibrationInput = {
  source?: {
    sourceNeighborhood?: string;
    likes?: string;
    mobilityPreference?: string;
    nearbyPriorities?: string[];
    dailyLifeNotes?: string;
    lifestylePicks?: string[];
    tradeoffs?: string[];
  };
  preferences: PreferenceVector;
  budgetMin: number;
  budgetMax: number;
  matches: MatchResult[];
};

type CalibrationResponse = {
  adjustments?: Array<{
    neighborhoodSlug: string;
    scoreDelta: number;
    reason: string;
  }>;
};

function extractJsonObject(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in Llama match calibration response.");
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function clampDelta(value: unknown) {
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numberValue)) return 0;
  return Math.round(Math.min(4, Math.max(-18, numberValue)));
}

function compactMatch(match: MatchResult) {
  return {
    slug: match.neighborhoodSlug,
    name: match.neighborhoodName,
    deterministicScore: match.score,
    summary: match.summary,
    vibeTags: match.vibeTags.slice(0, 8),
    bestForTags: match.bestForTags.slice(0, 8),
    rent: [match.rentMin, match.rentMax],
    reasons: match.reasons,
    features: match.features,
  };
}

function buildPrompt(input: MatchCalibrationInput) {
  return JSON.stringify({
    task:
      "Calibrate neighborhood match scores. Be stricter than a cosine matcher. Penalize weak lifestyle, budget, mobility, or daily-routine fit. Only use provided neighborhoods.",
    rules: [
      "Return JSON only.",
      "Do not invent neighborhoods or facts.",
      "Return exactly one adjustment for every provided match.",
      "scoreDelta must be an integer from -18 to 4.",
      "Use negative deltas when the score feels too generous.",
      "Use 0 only when the deterministic score is clearly fair.",
      "Use positive deltas rarely, only for unusually strong fit.",
      "If a match is above 90 but has any meaningful caveat, use a negative delta.",
      "For decent but not excellent matches, use -4 to -10.",
      "For weak practical, mobility, budget, or old-place fit, use -10 to -18.",
      "reason must be short and user-facing.",
    ],
    user: {
      sourceNeighborhood: input.source?.sourceNeighborhood ?? "",
      likes: input.source?.likes ?? "",
      mobilityPreference: input.source?.mobilityPreference ?? "",
      nearbyPriorities: input.source?.nearbyPriorities ?? [],
      dailyLifeNotes: input.source?.dailyLifeNotes ?? "",
      lifestylePicks: input.source?.lifestylePicks ?? [],
      tradeoffs: input.source?.tradeoffs ?? [],
      budget: [input.budgetMin, input.budgetMax],
      preferences: input.preferences,
    },
    matches: input.matches.map(compactMatch),
    outputShape: {
      adjustments: [
        {
          neighborhoodSlug: "existing-match-slug",
          scoreDelta: -8,
          reason: "Short reason for the adjustment.",
        },
      ],
    },
  });
}

export async function calibrateMatchesWithLlama(
  input: MatchCalibrationInput,
): Promise<MatchResult[]> {
  const candidates = input.matches.slice(0, 10);
  if (candidates.length === 0) return input.matches;

  const raw = await createGroqChatCompletion([
    {
      role: "system",
      content:
        "You are a strict relocation match calibrator for Polaris. You only adjust existing neighborhood scores. You return compact JSON.",
    },
    {
      role: "user",
      content: buildPrompt({ ...input, matches: candidates }),
    },
  ]);

  const parsed = JSON.parse(extractJsonObject(raw)) as CalibrationResponse;
  const bySlug = new Map(
    (parsed.adjustments ?? []).map((adjustment) => [
      adjustment.neighborhoodSlug,
      {
        scoreDelta: clampDelta(adjustment.scoreDelta),
        reason:
          typeof adjustment.reason === "string"
            ? adjustment.reason.trim().slice(0, 180)
            : "",
      },
    ]),
  );

  return input.matches
    .map((match) => {
      const adjustment = bySlug.get(match.neighborhoodSlug);
      if (!adjustment) return match;

      const score = Math.min(100, Math.max(0, match.score + adjustment.scoreDelta));
      const reason = adjustment.reason || "Llama calibration adjusted this match.";

      return {
        ...match,
        score,
        reasons:
          adjustment.scoreDelta < 0
            ? [...match.reasons.slice(0, 2), reason]
            : [reason, ...match.reasons].slice(0, 3),
        scoreBreakdown: {
          ...match.scoreBreakdown,
          llmAdjustment: adjustment.scoreDelta,
        },
        llmCalibration: adjustment,
      };
    })
    .sort((a, b) => b.score - a.score);
}
