"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MatchResult } from "@/lib/matching/types";

// Dynamic import for MapView since maplibregl uses document/window API
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex items-center justify-center border border-slate-200 rounded-2xl animate-pulse">
      <div className="text-slate-500 text-sm">Initializing interactive map...</div>
    </div>
  ),
});

interface SessionData {
  source: {
    sourceNeighborhood: string;
    sourceCity?: string;
    likes: string;
    dislikes?: string;
    mobilityPreference?: string;
    weatherPreference?: string;
    nearbyPriorities?: string[];
    dailyLifeNotes?: string;
    intent?: string;
    lifestylePicks?: string[];
    tradeoffs?: string[];
  };
  preferences: Record<string, number>;
  budgetMin: number;
  budgetMax: number;
  citySlug: string;
  profileId?: string;
}

type NearbyPlace = {
  id: string;
  name: string;
  category: "food" | "nightlife" | "wellness" | "practical";
  summary: string;
  priceRange?: string;
  vibeTags: string[];
  bestForTags: string[];
  lat?: number;
  lng?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

const PREFERENCE_LABELS: Record<string, string> = {
  walkability: "Walkability",
  transit: "Public Transit",
  nightlife: "Nightlife & Vibe",
  safety: "Safety & Quiet",
  cafes: "Cafes & Coffee",
  parks: "Green Spaces & Parks",
  young_professionals: "Young Professionals",
  affordability: "Affordability",
  diversity: "Diversity",
};

const FEATURE_KEY_MAP = {
  walkability: "walkability",
  transit: "transit",
  nightlife: "nightlife",
  safety: "safety",
  cafes: "cafes",
  parks: "parks",
  young_professionals: "youngProfessionals",
  affordability: "affordability",
  diversity: "diversity",
} as const;

const CATEGORY_LABELS: Record<NearbyPlace["category"], string> = {
  food: "Food & cafes",
  nightlife: "Nightlife",
  wellness: "Parks & wellness",
  practical: "Daily practicals",
};

const CATEGORY_STYLES: Record<NearbyPlace["category"], string> = {
  food: "bg-amber-50 text-amber-600",
  nightlife: "bg-rose-50 text-rose-600",
  wellness: "bg-emerald-50 text-emerald-700",
  practical: "bg-teal-50 text-teal-600",
};

const FOLLOW_UP_CHIPS = [
  "What's the catch?",
  "Compare with my #2",
  "Plan my first weekend",
  "Is this good without a car?",
];

const PRACTICAL_PLACE_KEYWORDS = [
  "grocery",
  "market",
  "supermarket",
  "pharmacy",
  "station",
  "transit",
  "subway",
  "path",
  "train",
  "bus",
  "park",
  "gym",
  "fitness",
  "clinic",
  "library",
  "laundry",
  "errand",
];

function formatUsd(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not loaded";
  return `$${Math.round(value).toLocaleString()}`;
}

function formatNumber(value?: number, digits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not loaded";
  return value.toFixed(digits);
}

function StatCard({
  label,
  value,
  caption,
  tone = "blue",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "blue" | "amber" | "teal" | "slate";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className={`rounded-2xl p-4 ring-1 ${styles[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tabular-nums text-slate-950">
        {value}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        {caption}
      </p>
    </div>
  );
}

function MeterRow({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-mono text-slate-500">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
      {note && <p className="mt-1 text-[10px] text-slate-400">{note}</p>}
    </div>
  );
}

function sentenceCase(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getPracticalPlaceScore(place: NearbyPlace) {
  const searchable = [
    place.name,
    place.summary,
    ...place.bestForTags,
    ...place.vibeTags,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (place.category === "practical") score += 8;
  if (place.category === "wellness") score += 4;
  if (place.category === "food") score += 1;
  if (place.category === "nightlife") score -= 2;

  for (const keyword of PRACTICAL_PLACE_KEYWORDS) {
    if (searchable.includes(keyword)) score += 2;
  }

  return score;
}

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [session, setSession] = useState<SessionData | null>(null);
  const [rawNeighborhoods, setRawNeighborhoods] = useState<MatchResult[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Preference sliders state
  const [sliderPrefs, setSliderPrefs] = useState<Record<string, number>>({});
  // Lifestyle weights panel is de-emphasized and collapsed by default
  const [showWeights, setShowWeights] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "I loaded your neighborhood matches. Pick a marker or a match card, then ask me to compare options, explain tradeoffs, or find places close by.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const citySlug = searchParams.get("city") || "nyc";

  const persistProfileState = async (updates: {
    matchedNeighborhoods?: Array<{
      neighborhoodProfileId: string;
      score: number;
      reasons: string[];
    }>;
    chatMessages?: ChatMessage[];
    lastSelectedNeighborhoodId?: string | null;
  }) => {
    const profileId = session?.profileId;
    if (!profileId) return;

    try {
      await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          ...updates,
        }),
      });
    } catch (error) {
      console.error("Profile state persist failed:", error);
    }
  };

  // 1. Load data on mount
  useEffect(() => {
    const rawSession = localStorage.getItem("polaris_onboarding");
    if (!rawSession) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as SessionData;
      setSession(parsed);
      setSliderPrefs(parsed.preferences);

      // Fetch initial matches
      const fetchMatches = async () => {
        try {
          const res = await fetch("/api/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              preferences: parsed.preferences,
              budgetMin: parsed.budgetMin,
              budgetMax: parsed.budgetMax,
              citySlug: parsed.citySlug,
              source: parsed.source,
            }),
          });
          const payload = await res.json();
          const fetchedMatches = payload.data?.matches as MatchResult[] | undefined;
          if (fetchedMatches) {
            setRawNeighborhoods(fetchedMatches);
            setMatches(fetchedMatches);
            if (fetchedMatches.length > 0) {
              setSelectedId(fetchedMatches[0].neighborhoodId);
            }
            if (parsed.profileId) {
              fetch("/api/user-profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  profileId: parsed.profileId,
                  matchedNeighborhoods: fetchedMatches
                    .slice(0, 5)
                    .map((match) => ({
                      neighborhoodProfileId: match.neighborhoodId,
                      score: match.score,
                      reasons: match.reasons,
                    })),
                  lastSelectedNeighborhoodId:
                    fetchedMatches[0]?.neighborhoodId ?? null,
                  chatMessages: messages,
                }),
              }).catch((error) => {
                console.error("Profile match save failed:", error);
              });
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchMatches();
    } catch (err) {
      console.error("Error loading session:", err);
      router.push("/");
    }
  }, [citySlug, router]);

  // 2. Load nearby places when selected neighborhood changes
  useEffect(() => {
    if (!selectedId) return;

    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const res = await fetch(`/api/places?neighborhoodId=${selectedId}&limit=30`);
        const payload = await res.json();
        if (payload.data) {
          setNearbyPlaces(payload.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, [selectedId]);

  useEffect(() => {
    if (!session?.profileId || !selectedId) return;

    persistProfileState({
      lastSelectedNeighborhoodId: selectedId,
    });
  }, [selectedId, session?.profileId]);

  // 3. Client-side re-scoring on slider change
  const handleSliderChange = (key: string, value: number) => {
    const updatedPrefs = { ...sliderPrefs, [key]: value };
    setSliderPrefs(updatedPrefs);

    if (!session || rawNeighborhoods.length === 0) return;

    // Recalculate client-side scores
    startTransition(() => {
      const recalculated = rawNeighborhoods.map((row) => {
        // Compute weighted feature closeness. This is stricter than cosine
        // similarity, which tends to overrate positive lifestyle vectors.
        let weightedTotal = 0;
        let weightSum = 0;

        Object.keys(FEATURE_KEY_MAP).forEach((prefKey) => {
          const typedPrefKey = prefKey as keyof typeof FEATURE_KEY_MAP;
          const featureKey = FEATURE_KEY_MAP[typedPrefKey];
          const a = updatedPrefs[prefKey] ?? 0.5;
          const dbVal = row.features[featureKey] ?? 0.5;
          const importance = 0.65 + Math.abs(a - 0.5) * 1.4;
          const closeness = Math.max(0, 1 - Math.abs(a - dbVal));

          weightedTotal += closeness * importance;
          weightSum += importance;
        });

        const similarity = weightSum === 0 ? 0.5 : weightedTotal / weightSum;
        const calibratedSimilarity = Math.max(0, Math.min(1, (similarity - 0.72) / 0.28));
        
        // Budget fit is already computed on the backend row representation
        const budgetFit = row.scoreBreakdown.budgetFit / 100;

        const rawScore = calibratedSimilarity * 0.7 + budgetFit * 0.3;
        const llmAdjustment = row.scoreBreakdown.llmAdjustment ?? 0;
        const score = Math.max(0, Math.min(100, Math.round(rawScore * 100) + llmAdjustment));

        // Friendly labels mapping for top reasons
        const contributions = [
          { label: "Highly walkable streets", value: (updatedPrefs.walkability ?? 0.5) * row.features.walkability },
          { label: "Excellent public transit", value: (updatedPrefs.transit ?? 0.5) * row.features.transit },
          { label: "Vibrant nightlife and dining", value: (updatedPrefs.nightlife ?? 0.5) * row.features.nightlife },
          { label: "Very safe and quiet streets", value: (updatedPrefs.safety ?? 0.5) * row.features.safety },
          { label: "Thriving cafe and coffee culture", value: (updatedPrefs.cafes ?? 0.5) * row.features.cafes },
          { label: "Beautiful parks and green spaces", value: (updatedPrefs.parks ?? 0.5) * row.features.parks },
          { label: "Popular with young professionals", value: (updatedPrefs.young_professionals ?? 0.5) * row.features.youngProfessionals },
          { label: "Great rental affordability", value: (updatedPrefs.affordability ?? 0.5) * row.features.affordability },
          { label: "Rich cultural diversity", value: (updatedPrefs.diversity ?? 0.5) * row.features.diversity },
        ];
        contributions.sort((a, b) => b.value - a.value);
        const reasons = contributions.slice(0, 3).map((c) => c.label);

        return {
          ...row,
          score,
          reasons,
          scoreBreakdown: {
            similarity: Math.round(calibratedSimilarity * 100),
            budgetFit: row.scoreBreakdown.budgetFit,
            llmAdjustment,
          },
        };
      });

      // Sort descending
      recalculated.sort((a, b) => b.score - a.score);
      setMatches(recalculated);
    });
  };

  // 4. Handle Chat Send
  const sendChatMessage = async (message: string) => {
    const userMessage = message.trim();
    if (!userMessage || chatLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citySlug: session?.citySlug ?? citySlug,
          message: userMessage,
          messages: nextMessages,
          preferences: sliderPrefs,
          matches,
          selectedNeighborhoodId: selectedId,
          sourceContext: session?.source,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Chat request failed.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: payload.data?.message || "I could not find enough local context to answer that cleanly.",
        createdAt: new Date().toISOString(),
      };
      const persistedMessages = [...nextMessages, assistantMessage];
      setMessages(persistedMessages);
      persistProfileState({
        chatMessages: persistedMessages,
        lastSelectedNeighborhoodId: selectedId,
      });
    } catch (err) {
      console.error(err);
      const currentSelected = matches.find((m) => m.neighborhoodId === selectedId);
      const fallbackText = currentSelected
        ? `Based on ${currentSelected.neighborhoodName}'s stored profile, it matches at ${currentSelected.score}% because of ${currentSelected.reasons.slice(0, 2).join(" and ").toLowerCase()}.`
        : "I could not load the local context for that question yet.";
      const persistedMessages: ChatMessage[] = [
        ...nextMessages,
        {
          role: "assistant",
          content: fallbackText,
          createdAt: new Date().toISOString(),
        },
      ];
      setMessages(persistedMessages);
      persistProfileState({
        chatMessages: persistedMessages,
        lastSelectedNeighborhoodId: selectedId,
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendChatMessage(chatInput);
  };

  const selectedNeighborhood = matches.find((m) => m.neighborhoodId === selectedId);
  const selectedExternalMetrics = selectedNeighborhood?.externalMetrics ?? {};
  const streetEasy = selectedExternalMetrics.streetEasy;
  const hasNycExternalData =
    citySlug === "nyc" &&
    (typeof selectedExternalMetrics.zillowZoriCityRentUsd === "number" ||
      typeof selectedExternalMetrics.epaWalkabilityIndex === "number" ||
      typeof streetEasy?.medianBaseRentUsd === "number");
  const walkabilityOutOfTwenty =
    typeof selectedExternalMetrics.epaWalkabilityIndex === "number"
      ? selectedExternalMetrics.epaWalkabilityIndex
      : undefined;
  const walkabilityNormalized =
    typeof walkabilityOutOfTwenty === "number"
      ? Math.max(0, Math.min(1, walkabilityOutOfTwenty / 20))
      : selectedNeighborhood?.features.walkability ?? 0.5;
  const monthlyBudgetMidpoint =
    session && Number.isFinite(session.budgetMin) && Number.isFinite(session.budgetMax)
      ? Math.round((session.budgetMin + session.budgetMax) / 2)
      : undefined;
  const selectedRentMidpoint = selectedNeighborhood
    ? Math.round((selectedNeighborhood.rentMin + selectedNeighborhood.rentMax) / 2)
    : undefined;
  const selectedMarketRent =
    streetEasy?.medianBaseRentUsd ?? selectedRentMidpoint;
  const rentComparedToBudget =
    monthlyBudgetMidpoint && selectedMarketRent
      ? selectedMarketRent - monthlyBudgetMidpoint
      : undefined;
  const placeCategoryCounts = nearbyPlaces.reduce(
    (counts, place) => {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
      return counts;
    },
    {} as Partial<Record<NearbyPlace["category"], number>>,
  );
  const practicalNearbyPlaces = [...nearbyPlaces].sort((a, b) => {
    const scoreDelta = getPracticalPlaceScore(b) - getPracticalPlaceScore(a);
    if (scoreDelta !== 0) return scoreDelta;
    return a.name.localeCompare(b.name);
  });
  const topNearbyTags = Array.from(
    new Set(
      practicalNearbyPlaces.flatMap((place) => [
        ...place.bestForTags.slice(0, 2),
        ...place.vibeTags.slice(0, 2),
      ]),
    ),
  ).slice(0, 6);
  const quickMatchReason = selectedNeighborhood
    ? `${selectedNeighborhood.neighborhoodName} fits because it matches your ${selectedNeighborhood.reasons
        .slice(0, 2)
        .map((reason) => reason.toLowerCase())
        .join(" and ")}.`
    : "";
  const mapCenter = useMemo<[number, number]>(
    () =>
      selectedNeighborhood
        ? [selectedNeighborhood.lng, selectedNeighborhood.lat]
        : [-74.006, 40.7128],
    [selectedNeighborhood?.lat, selectedNeighborhood?.lng],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-light text-slate-600">Matching lifestyles...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md px-6 py-3 flex items-center justify-between z-30 flex-shrink-0 shadow-soft-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
            <span aria-hidden>←</span> Home
          </Link>
          <span className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-bold shadow-brand">CA</span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Relocation Dashboard
            </h1>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {citySlug}
            </span>
          </div>
        </div>
        {session?.source.sourceNeighborhood && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className="text-slate-400">Moving from</span>
            <span className="font-semibold text-slate-700">
              {session.source.sourceNeighborhood}
              {session.source.sourceCity ? `, ${session.source.sourceCity}` : ""}
            </span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Matches (prominent) + collapsible weights */}
        <aside className="w-[22rem] bg-slate-50 flex flex-col flex-shrink-0 min-h-0">
          {/* Section: Matches List — the hero of the dashboard */}
          <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your top matches</h2>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                {matches.length} found
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ranked neighborhoods that fit your lifestyle and budget. Select one to explore it on the map.
            </p>

            <div className="space-y-3">
              {matches.map((match, index) => {
                const isSelected = match.neighborhoodId === selectedId;
                const isTop = index === 0;
                const isTopSelected = isTop && isSelected;
                return (
                  <button
                    key={match.neighborhoodId}
                    onClick={() => setSelectedId(match.neighborhoodId)}
                    className={`relative w-full text-left rounded-3xl transition-all duration-200 ${
                      isTop
                        ? isSelected
                          ? "bg-blue-500 text-white shadow-brand-lg scale-[1.01] p-5 pt-6"
                          : "bg-blue-50 shadow-soft hover:shadow-brand hover:scale-[1.01] ring-1 ring-blue-100 p-5 pt-6"
                        : isSelected
                          ? "bg-blue-100 shadow-soft ring-2 ring-blue-300 p-4"
                          : "bg-white hover:bg-blue-50/60 hover:shadow-soft p-4"
                    }`}
                  >
                    {isTop && (
                      <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-soft">
                        ★ Best match
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 flex items-center justify-center rounded-2xl font-bold ${
                          isTop
                            ? isSelected ? "h-12 w-12 text-lg bg-white text-blue-600" : "h-12 w-12 text-lg bg-blue-600 text-white"
                            : "h-9 w-9 text-sm bg-slate-100 text-slate-600"
                        }`}
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold truncate ${isTop ? "text-base" : "text-sm"} ${isTopSelected ? "text-white" : "text-slate-900"}`}>
                            {match.neighborhoodName}
                          </h4>
                          <div className="flex items-baseline gap-0.5 flex-shrink-0">
                            <span className={`font-bold tabular-nums ${isTop ? "text-xl" : "text-base"} ${isTopSelected ? "text-white" : isTop ? "text-blue-700" : "text-slate-700"}`}>
                              {match.score}
                            </span>
                            <span className={`text-[10px] font-semibold ${isTopSelected ? "text-white/70" : "text-slate-400"}`}>%</span>
                          </div>
                        </div>
                        {/* Score bar */}
                        <div className={`mt-2 h-2 w-full rounded-full overflow-hidden ${isTopSelected ? "bg-white/25" : "bg-slate-100"}`}>
                          <div
                            className={`h-full rounded-full ${isTopSelected ? "bg-white" : isTop ? "bg-blue-500" : "bg-blue-400"}`}
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {match.reasons.slice(0, isTop ? 3 : 2).map((reason: string) => (
                        <span
                          key={reason}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                            isTopSelected ? "bg-white/20 text-white" : isTop ? "bg-white text-blue-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    {isTop && (
                      <p className={`mt-3 text-xs leading-relaxed line-clamp-3 ${isTopSelected ? "text-white/90" : "text-slate-600"}`}>
                        {match.summary}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Lifestyle Weights — de-emphasized & collapsible */}
          <div className="bg-white flex-shrink-0 shadow-[0_-4px_16px_rgba(60,52,42,0.05)]">
            <button
              type="button"
              onClick={() => setShowWeights((v) => !v)}
              aria-expanded={showWeights}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fine-tune lifestyle weights</span>
                {isPending && <span className="text-[10px] text-blue-600 animate-pulse">Recalculating…</span>}
              </span>
              <span className={`text-slate-400 text-lg leading-none transition-transform ${showWeights ? "rotate-45" : ""}`} aria-hidden>
                +
              </span>
            </button>
            {showWeights && (
              <div className="px-5 pb-5 pt-1 space-y-3 max-h-64 overflow-y-auto">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Optional — nudge a slider to re-rank the matches above.
                </p>
                {Object.keys(sliderPrefs).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{PREFERENCE_LABELS[key] || key}</span>
                      <span className="text-slate-600 font-medium tabular-nums">{Math.round((sliderPrefs[key] || 0) * 10)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sliderPrefs[key] || 0}
                      onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                      className="w-full accent-blue-600 bg-slate-200 h-1 cursor-pointer appearance-none rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center/Right Area: Map, Nearby Fit & Chat */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
          
          {/* Map Section */}
          <section className="flex-1 p-6 relative flex flex-col h-1/2 md:h-full min-h-0">
            <MapView
              matches={matches}
              places={nearbyPlaces}
              selectedId={selectedId}
              onSelect={setSelectedId}
              center={mapCenter}
            />
            {selectedNeighborhood && (
              <button
                type="button"
                onClick={() => setShowStatsPanel(true)}
                className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-left text-xs font-bold text-slate-900 shadow-[0_12px_34px_rgba(15,23,42,0.18)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-brand"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  {hasNycExternalData ? "NY" : "%"}
                </span>
                <span>
                  Match evidence
                  <span className="block text-[10px] font-medium text-slate-500">
                    {hasNycExternalData
                      ? "NYC public data loaded"
                      : "Budget and lifestyle fit"}
                  </span>
                </span>
              </button>
            )}
          </section>

          {/* Details Sidebar */}
          <section className="w-full md:w-96 bg-white overflow-y-auto flex flex-col h-1/2 md:h-full flex-shrink-0 min-h-0 shadow-[-4px_0_20px_rgba(60,52,42,0.05)]">
            {/* Selected Neighborhood Details */}
            {selectedNeighborhood && (
              <div className="p-5 bg-blue-50/50">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Now exploring
                </span>
                <div className="flex justify-between items-start gap-3">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedNeighborhood.neighborhoodName}</h2>
                  <span className="flex-shrink-0 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold shadow-brand">
                    {selectedNeighborhood.score}% Fit
                  </span>
                </div>
                
                {/* Rent Range Indicator */}
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 bg-white rounded-2xl px-3.5 py-2 shadow-soft-sm">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Rent</span>
                  <span className="text-slate-900 font-bold">
                    ${selectedNeighborhood.rentMin.toLocaleString()}{selectedNeighborhood.rentMin === selectedNeighborhood.rentMax ? "" : ` – $${selectedNeighborhood.rentMax.toLocaleString()}`}
                  </span>
                  <span className="text-slate-400 text-xs">/mo</span>
                </div>

                <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-700 shadow-soft-sm">
                  {quickMatchReason}
                </p>

                {streetEasy && (
                  <div className="mt-3 grid gap-2">
                    {typeof streetEasy.medianBaseRentUsd === "number" && (
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-soft-sm">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          StreetEasy median base rent
                        </div>
                        <div className="mt-0.5 text-lg font-black text-slate-950">
                          ${streetEasy.medianBaseRentUsd.toLocaleString()}
                          <span className="ml-1 text-xs font-semibold text-slate-400">/mo</span>
                        </div>
                      </div>
                    )}
                    {(streetEasy.bestPerk || streetEasy.biggestDownside) && (
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                        {streetEasy.bestPerk && (
                          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">
                              Best perk
                            </span>
                            {streetEasy.bestPerk}
                          </div>
                        )}
                        {streetEasy.biggestDownside && (
                          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600">
                              Watch-out
                            </span>
                            {streetEasy.biggestDownside}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nearby Fit Subsection */}
            <div className="flex-1 min-h-0 p-5 flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950">Nearby fit</h3>
                  <p className="text-xs text-slate-500">Errands, transit, parks, and useful anchors.</p>
                </div>
                {nearbyPlaces.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                    {nearbyPlaces.length} places
                  </span>
                )}
              </div>
              
              {loadingPlaces ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : nearbyPlaces.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8 text-xs text-slate-500">
                  No nearby-fit places are saved for this neighborhood yet.
                </div>
              ) : (
                <div className="flex-1 min-h-0 space-y-3 overflow-y-auto no-scrollbar pr-1">
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(CATEGORY_LABELS) as NearbyPlace["category"][]).map((category) => (
                      <div
                        key={category}
                        className={`rounded-2xl px-2.5 py-2 text-center ${CATEGORY_STYLES[category]}`}
                      >
                        <div className="text-lg font-black leading-tight">
                          {placeCategoryCounts[category] ?? 0}
                        </div>
                        <div className="truncate text-[9px] font-bold">
                          {category}
                        </div>
                      </div>
                    ))}
                  </div>

                  {topNearbyTags.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Good when you want
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {topNearbyTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    {practicalNearbyPlaces.slice(0, 10).map((place) => (
                      <div
                        key={place.id}
                        className={`bg-slate-50 hover:bg-white hover:shadow-soft border-l-4 p-3 rounded-2xl transition-all ${
                          place.category === "food"
                            ? "border-l-amber-400"
                            : place.category === "nightlife"
                              ? "border-l-rose-500"
                              : place.category === "wellness"
                                ? "border-l-emerald-400"
                                : "border-l-teal-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-xs font-bold text-slate-900">
                              {place.name}
                            </h4>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                              {sentenceCase(place.bestForTags[0] || place.vibeTags[0] || place.category)}
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap font-semibold ${CATEGORY_STYLES[place.category]}`}>
                            {place.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </section>

          <button
            type="button"
            onClick={() => setShowChatPanel((value) => !value)}
            aria-label="Ask Polaris"
            aria-expanded={showChatPanel}
            className="absolute bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95"
          >
            AI
          </button>

          {showChatPanel && (
            <div className="absolute bottom-24 right-6 z-30 flex h-[28rem] w-[min(24rem,calc(100vw-3rem))] flex-col rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-black text-slate-950">Ask Polaris</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedNeighborhood
                      ? `Questions about ${selectedNeighborhood.neighborhoodName}`
                      : "Questions about your matches"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChatPanel(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-200"
                  aria-label="Close Polaris"
                >
                  x
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 text-xs space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-slate-100 text-slate-700 bubble-ai"
                      : "bg-blue-600 text-white self-end ml-auto bubble-user"
                  }`}>
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl max-w-[85%] bubble-ai">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  {FOLLOW_UP_CHIPS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={chatLoading}
                      onClick={() => sendChatMessage(question)}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleChatSend} className="flex gap-2 p-4">
                <input
                  type="text"
                  placeholder={`Ask about ${selectedNeighborhood?.neighborhoodName || "neighborhoods"}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="min-w-0 flex-1 rounded-full border-2 border-transparent bg-slate-100 px-4 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-brand transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {selectedNeighborhood && (
            <div
              className={`absolute inset-x-0 bottom-0 z-40 mx-3 rounded-t-[28px] border border-slate-200 bg-white shadow-[0_-24px_70px_rgba(15,23,42,0.22)] transition-transform duration-300 ease-out md:mx-6 ${
                showStatsPanel ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="mx-auto h-full max-w-6xl">
                <button
                  type="button"
                  onClick={() => setShowStatsPanel((value) => !value)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
                  aria-expanded={showStatsPanel}
                >
                  <div className="flex items-center gap-4">
                    <span className="h-1.5 w-12 rounded-full bg-slate-300" aria-hidden />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {session?.source.sourceNeighborhood
                          ? `${session.source.sourceNeighborhood} -> New York`
                          : "New York stats"}
                      </p>
                      <h3 className="text-base font-black text-slate-950">
                        {selectedNeighborhood.neighborhoodName} match evidence
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {showStatsPanel ? "Hide" : "Open"}
                  </span>
                </button>

                <div className="max-h-[58vh] overflow-y-auto border-t border-slate-100 px-5 pb-6 pt-5 md:px-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl bg-slate-950 p-5 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                        Your budget
                      </div>
                      <h4 className="mt-2 text-xl font-black">
                        {session
                          ? `$${session.budgetMin.toLocaleString()} - $${session.budgetMax.toLocaleString()}`
                          : "Not set"}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {selectedNeighborhood
                          ? `${selectedNeighborhood.neighborhoodName} is stored at $${selectedNeighborhood.rentMin.toLocaleString()} - $${selectedNeighborhood.rentMax.toLocaleString()} per month${
                              streetEasy?.medianBaseRentUsd
                                ? `, with StreetEasy showing $${streetEasy.medianBaseRentUsd.toLocaleString()} as an external rent signal`
                                : ""
                            }.`
                          : "Pick a neighborhood to see rent fit."}
                      </p>
                    </div>

                    <StatCard
                      label="Neighborhood rent"
                      value={formatUsd(selectedMarketRent)}
                      caption={
                        streetEasy
                          ? `StreetEasy median base rent for ${selectedNeighborhood.neighborhoodName}. Base rent excludes extra fees.`
                          : "Estimated neighborhood rent range midpoint from our stored profile."
                      }
                      tone="amber"
                    />

                    <StatCard
                      label="Rent fit"
                      value={
                        typeof rentComparedToBudget === "number"
                          ? rentComparedToBudget <= 0
                            ? `$${Math.abs(rentComparedToBudget).toLocaleString()} under`
                            : `$${rentComparedToBudget.toLocaleString()} over`
                          : "Not loaded"
                      }
                      caption="Compares the best available neighborhood rent signal against your budget midpoint."
                      tone="blue"
                    />

                    <StatCard
                      label="EPA walkability"
                      value={
                        typeof walkabilityOutOfTwenty === "number"
                          ? `${formatNumber(walkabilityOutOfTwenty, 1)} / 20`
                          : `${Math.round(selectedNeighborhood.features.walkability * 100)}%`
                      }
                      caption={
                        selectedExternalMetrics.epaBlockGroupGeoid
                          ? `Matched by neighborhood center to Census block group ${selectedExternalMetrics.epaBlockGroupGeoid}.`
                          : "Internal walkability signal from the neighborhood profile."
                      }
                      tone="teal"
                    />
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-950">
                          Why this neighborhood is being suggested
                        </h4>
                        <p className="text-xs text-slate-500">
                          Your extracted preferences compared with the selected neighborhood profile.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                        {selectedNeighborhood.score}% fit
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <MeterRow
                        label="Lifestyle similarity"
                        value={selectedNeighborhood.scoreBreakdown.similarity / 100}
                        note="How close the neighborhood vector is to what you described."
                      />
                      <MeterRow
                        label="Budget fit"
                        value={selectedNeighborhood.scoreBreakdown.budgetFit / 100}
                        note="How well your budget overlaps with our stored rent range."
                      />
                      <MeterRow
                        label={
                          typeof walkabilityOutOfTwenty === "number"
                            ? "EPA walkability signal"
                            : "Walkability signal"
                        }
                        value={walkabilityNormalized}
                        note={
                          typeof walkabilityOutOfTwenty === "number"
                            ? "NYC public dataset signal."
                            : "Profile score used by matching today."
                        }
                      />
                      <MeterRow
                        label="Internal transit score"
                        value={selectedNeighborhood.features.transit}
                        note="Profile score used by matching today."
                      />
                    </div>
                    {selectedNeighborhood.llmCalibration && (
                      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
                        <span className="font-bold text-slate-900">
                          Llama calibration{" "}
                          {selectedNeighborhood.llmCalibration.scoreDelta > 0 ? "+" : ""}
                          {selectedNeighborhood.llmCalibration.scoreDelta}:
                        </span>{" "}
                        {selectedNeighborhood.llmCalibration.reason}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h4 className="text-sm font-black text-slate-950">
                      What this means
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {selectedNeighborhood.neighborhoodName} is being recommended because the lifestyle profile lines up with what you described, while the rent signal is checked against your budget.
                      {streetEasy
                        ? " StreetEasy adds a practical layer with market rent, strongest perk, and biggest watch-out."
                        : " The practical layer comes from the stored neighborhood profile, nearby places, and matching scores."}
                    </p>
                    {streetEasy?.mood && (
                      <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-slate-600">
                        <span className="font-bold text-slate-900">Local mood: </span>
                        {streetEasy.mood}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
          <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-light text-slate-600">Loading results...</h2>
        </div>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
