"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
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
  food: "border-orange-200 bg-orange-50 text-orange-700",
  nightlife: "border-purple-200 bg-purple-50 text-purple-700",
  wellness: "border-emerald-200 bg-emerald-50 text-emerald-700",
  practical: "border-sky-200 bg-sky-50 text-sky-700",
};

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
  
  // Chat state
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "I loaded your neighborhood matches. Pick a marker or a match card, then ask me to compare options, explain tradeoffs, or find places close by.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const citySlug = searchParams.get("city") || "nyc";

  // 1. Load data on mount
  useEffect(() => {
    const rawSession = localStorage.getItem("city_agent_onboarding");
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
        const res = await fetch(`/api/places?neighborhoodId=${selectedId}&limit=12`);
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

  // 3. Client-side re-scoring on slider change
  const handleSliderChange = (key: string, value: number) => {
    const updatedPrefs = { ...sliderPrefs, [key]: value };
    setSliderPrefs(updatedPrefs);

    if (!session || rawNeighborhoods.length === 0) return;

    // Recalculate client-side scores
    startTransition(() => {
      const recalculated = rawNeighborhoods.map((row) => {
        // Compute cosine similarity
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        Object.keys(FEATURE_KEY_MAP).forEach((prefKey) => {
          const typedPrefKey = prefKey as keyof typeof FEATURE_KEY_MAP;
          const featureKey = FEATURE_KEY_MAP[typedPrefKey];
          const a = updatedPrefs[prefKey] ?? 0.5;
          const dbVal = row.features[featureKey] ?? 0.5;

          dotProduct += a * dbVal;
          normA += a * a;
          normB += dbVal * dbVal;
        });

        const similarity = normA === 0 || normB === 0 ? 0.5 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        
        // Budget fit is already computed on the backend row representation
        const budgetFit = row.scoreBreakdown.budgetFit / 100;

        const rawScore = similarity * 0.7 + budgetFit * 0.3;
        const score = Math.round(rawScore * 100);

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
            similarity: Math.round(similarity * 100),
            budgetFit: row.scoreBreakdown.budgetFit,
          },
        };
      });

      // Sort descending
      recalculated.sort((a, b) => b.score - a.score);
      setMatches(recalculated);
    });
  };

  // 4. Handle Chat Send
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    const nextMessages = [...messages, { role: "user", content: userMessage }];
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.data?.message || "I could not find enough local context to answer that cleanly.",
        },
      ]);
    } catch (err) {
      console.error(err);
      const currentSelected = matches.find((m) => m.neighborhoodId === selectedId);
      const fallbackText = currentSelected
        ? `Based on ${currentSelected.neighborhoodName}'s stored profile, it matches at ${currentSelected.score}% because of ${currentSelected.reasons.slice(0, 2).join(" and ").toLowerCase()}.`
        : "I could not load the local context for that question yet.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallbackText }]);
    } finally {
      setChatLoading(false);
    }
  };

  const selectedNeighborhood = matches.find((m) => m.neighborhoodId === selectedId);
  const placeCategoryCounts = nearbyPlaces.reduce(
    (counts, place) => {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
      return counts;
    },
    {} as Partial<Record<NearbyPlace["category"], number>>,
  );
  const topNearbyTags = Array.from(
    new Set(
      nearbyPlaces.flatMap((place) => [
        ...place.bestForTags.slice(0, 2),
        ...place.vibeTags.slice(0, 2),
      ]),
    ),
  ).slice(0, 6);
  const mapCenter: [number, number] = selectedNeighborhood
    ? [selectedNeighborhood.lng, selectedNeighborhood.lat]
    : [-74.006, 40.7128]; // NYC default

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-light text-slate-600">Matching lifestyles...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-900 text-sm">
            ← Home
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <h1 className="text-lg font-light text-slate-900 tracking-tight">
            City Agent Relocation Dashboard — <span className="font-semibold text-blue-600 uppercase">{citySlug}</span>
          </h1>
        </div>
        {session?.source.sourceNeighborhood && (
          <div className="text-xs text-slate-500">
            Source: {session.source.sourceNeighborhood}
            {session.source.sourceCity ? `, ${session.source.sourceCity}` : ""}
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Sliders & Matches */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto p-6 flex flex-col gap-8 flex-shrink-0">
          {/* Section: Preference Weights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lifestyle Weights</h3>
              {isPending && <span className="text-[10px] text-blue-600 animate-pulse">Calculating...</span>}
            </div>
            <div className="space-y-4">
              {Object.keys(sliderPrefs).map((key) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{PREFERENCE_LABELS[key] || key}</span>
                    <span className="text-slate-700 font-medium">{Math.round((sliderPrefs[key] || 0) * 10)}</span>
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
          </div>

          {/* Section: Matches List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Matched Neighborhoods</h3>
            <div className="space-y-3">
              {matches.map((match) => {
                const isSelected = match.neighborhoodId === selectedId;
                return (
                  <button
                    key={match.neighborhoodId}
                    onClick={() => setSelectedId(match.neighborhoodId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 shadow-md"
                        : "bg-white border-slate-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-slate-900 text-sm">{match.neighborhoodName}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          match.score >= 90
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {match.score}% match
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.reasons.slice(0, 2).map((reason: string) => (
                        <span key={reason} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {match.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center/Right Area: Map, Nearby Fit & Chat */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Map Section */}
          <section className="flex-1 p-6 relative flex flex-col h-1/2 md:h-full">
            <MapView
              matches={matches}
              selectedId={selectedId}
              onSelect={setSelectedId}
              center={mapCenter}
            />
          </section>

          {/* Details & Chat Overlay Sidebar */}
          <section className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-white overflow-y-auto flex flex-col h-1/2 md:h-full flex-shrink-0">
            {/* Selected Neighborhood Details */}
            {selectedNeighborhood && (
              <div className="p-6 border-b border-slate-200 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-light text-slate-900">{selectedNeighborhood.neighborhoodName}</h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold border border-blue-200">
                    {selectedNeighborhood.score}% Fit
                  </span>
                </div>
                
                {/* Rent Range Indicator */}
                <div className="text-sm text-slate-500 mb-4 font-light">
                  Typical rent range:{" "}
                  <span className="text-slate-900 font-medium">
                    ${selectedNeighborhood.rentMin.toLocaleString()} – {selectedNeighborhood.rentMin === selectedNeighborhood.rentMax ? "" : `$${selectedNeighborhood.rentMax.toLocaleString()}`}
                  </span>
                  /month
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedNeighborhood.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...selectedNeighborhood.vibeTags, ...selectedNeighborhood.bestForTags]
                    .slice(0, 7)
                    .map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-50 px-2 py-1 rounded-full border border-slate-200 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                {/* Reasons List */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top match drivers</h4>
                  <ul className="space-y-1.5">
                    {selectedNeighborhood.reasons.map((reason: string) => (
                      <li key={reason} className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-600 rounded-full" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Nearby Fit Subsection */}
            <div className="p-6 border-b border-slate-200 flex-1 min-h-[200px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nearby Fit</h3>
                {nearbyPlaces.length > 0 && (
                  <span className="text-[10px] text-slate-500">
                    {nearbyPlaces.length} saved places
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
                <div className="space-y-4 max-h-[22rem] overflow-y-auto no-scrollbar pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CATEGORY_LABELS) as NearbyPlace["category"][]).map((category) => (
                      <div
                        key={category}
                        className={`rounded-xl border px-3 py-2 ${CATEGORY_STYLES[category]}`}
                      >
                        <div className="text-[10px] font-semibold">
                          {CATEGORY_LABELS[category]}
                        </div>
                        <div className="text-lg font-semibold leading-tight">
                          {placeCategoryCounts[category] ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>

                  {topNearbyTags.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Good when you want
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {topNearbyTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-slate-50 px-2 py-1 rounded-full border border-slate-200 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {nearbyPlaces.slice(0, 8).map((place) => (
                      <div
                        key={place.id}
                        className={`bg-white border-l-4 border border-slate-200 hover:border-blue-200 p-4 rounded-xl transition-all ${
                          place.category === "food"
                            ? "border-l-orange-400"
                            : place.category === "nightlife"
                              ? "border-l-purple-400"
                              : place.category === "wellness"
                                ? "border-l-emerald-400"
                                : "border-l-sky-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-medium text-slate-900">
                              {place.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {place.summary}
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap ${CATEGORY_STYLES[place.category]}`}>
                            {place.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chatbox Panel */}
            <div className="p-6 bg-slate-50 flex flex-col h-80 border-t border-slate-200 justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ask City Agent</h3>
              
              <div className="flex-1 overflow-y-auto text-xs space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white border border-slate-200 text-slate-700 bubble-ai"
                      : "bg-blue-50 border border-blue-200 text-blue-700 self-end ml-auto bubble-user"
                  }`}>
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl max-w-[85%] bubble-ai">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Ask about ${selectedNeighborhood?.neighborhoodName || "neighborhoods"}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          </section>
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
