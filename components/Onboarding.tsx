"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingProps {
  onComplete?: (data: {
    source: {
      sourceNeighborhood: string;
      sourceCity: string;
      likes: string;
      dislikes: string;
      mobilityPreference?: string;
      nearbyPriorities?: string[];
      dailyLifeNotes?: string;
      lifestylePicks?: string[];
      tradeoffs?: string[];
    };
    preferences: Record<string, number>;
    budgetMin: number;
    budgetMax: number;
    citySlug: string;
    profileId?: string;
  }) => void;
}

const CITIES = [
  {
    name: "New York City",
    slug: "nyc",
    country: "United States",
    currency: "USD",
    symbol: "$",
    defaultMin: 1500,
    defaultMax: 4500,
    minBound: 800,
    maxBound: 8000,
    step: 100,
    desc: "Energy, iconic skyline, and infinite variety.",
  },
  {
    name: "Toronto",
    slug: "toronto",
    country: "Canada",
    currency: "USD",
    symbol: "$",
    defaultMin: 1200,
    defaultMax: 3500,
    minBound: 800,
    maxBound: 6000,
    step: 100,
    desc: "Diverse culture, safe streets, and parklands.",
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    country: "India",
    currency: "USD",
    symbol: "$",
    defaultMin: 500,
    defaultMax: 1800,
    minBound: 250,
    maxBound: 3500,
    step: 50,
    desc: "Maximum City: vibrant nightlife, sea breeze, and rich history.",
  },
];

const MOBILITY_OPTIONS = [
  "Mostly walking",
  "Public transport",
  "Driving",
  "Rideshare/taxi",
  "Bike friendly",
];

const NEARBY_PRIORITY_OPTIONS = [
  "Grocery shops",
  "Coffee shops",
  "Parks",
  "Gyms",
  "Public transport",
  "Restaurants",
  "Pharmacies",
  "Nightlife",
  "Coworking",
];

const LIFESTYLE_OPTIONS = [
  "Quiet streets",
  "Good coffee",
  "Parks nearby",
  "Nightlife",
  "Public transit",
  "Groceries close",
  "Social energy",
  "Creative scene",
  "Safer-feeling area",
  "Budget-friendly",
  "Walkable errands",
  "Great food",
];

const TRADEOFF_OPTIONS = [
  "Cheaper rent over perfect location",
  "Better location over more space",
  "Quiet over nightlife",
  "Social energy over calm",
  "Transit access over driving",
  "Familiar vibe over adventure",
  "New adventure over familiar vibe",
];

const TOTAL_STEPS = 5;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Form State
  const [sourceNeighborhood, setSourceNeighborhood] = useState("Atlanta, USA");
  const [likes, setLikes] = useState(
    "I liked the tree-lined neighborhoods, friendly energy, coffee shops, parks, good food, and that it felt social without being as intense as New York.",
  );
  const [lifestylePicks, setLifestylePicks] = useState<string[]>([
    "Good coffee",
    "Parks nearby",
    "Social energy",
    "Groceries close",
  ]);
  const [mobilityPreference, setMobilityPreference] = useState("Public transport");
  const [nearbyPriorities, setNearbyPriorities] = useState<string[]>([
    "Grocery shops",
    "Coffee shops",
    "Parks",
  ]);
  const [dailyLifeNotes, setDailyLifeNotes] = useState(
    "I want easy everyday errands, a few comfortable places to work or read, and enough things nearby that weekends do not feel repetitive.",
  );
  const [tradeoffs, setTradeoffs] = useState<string[]>([
    "Transit access over driving",
    "Better location over more space",
  ]);
  const [destCitySlug, setDestCitySlug] = useState("nyc");
  
  // Budget values
  const currentCityConfig = CITIES.find((c) => c.slug === destCitySlug) || CITIES[0];
  const [budgetMin, setBudgetMin] = useState(currentCityConfig.defaultMin);
  const [budgetMax, setBudgetMax] = useState(currentCityConfig.defaultMax);

  const handleCitySelect = (slug: string) => {
    setDestCitySlug(slug);
    const config = CITIES.find((c) => c.slug === slug)!;
    setBudgetMin(config.defaultMin);
    setBudgetMax(config.defaultMax);
  };

  const nextStep = () => {
    if (step === 2 && (!sourceNeighborhood.trim() || !likes.trim())) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const toggleNearbyPriority = (priority: string) => {
    setNearbyPriorities((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority],
    );
  };

  const toggleLifestylePick = (pick: string) => {
    setLifestylePicks((current) =>
      current.includes(pick)
        ? current.filter((item) => item !== pick)
        : [...current, pick],
    );
  };

  const toggleTradeoff = (tradeoff: string) => {
    setTradeoffs((current) =>
      current.includes(tradeoff)
        ? current.filter((item) => item !== tradeoff)
        : [...current, tradeoff],
    );
  };

  useEffect(() => {
    if (step !== TOTAL_STEPS) {
      setRevealProgress(0);
      setAutoSubmitted(false);
      return;
    }

    setRevealProgress(0);
    setAutoSubmitted(false);
    const timings = [520, 1350, 2450, 3350, 4650];
    const timers = timings.map((delay, index) =>
      window.setTimeout(() => setRevealProgress(index + 1), delay),
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [step]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Call extraction API
      const res = await fetch("/api/extract-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceNeighborhood,
          destinationCity: destCitySlug,
          likes,
          lifestylePicks,
          mobilityPreference,
          nearbyPriorities,
          dailyLifeNotes,
          tradeoffs,
        }),
      });

      if (!res.ok) throw new Error("Preference extraction failed");

      const payload = await res.json();
      const extractedPrefs = payload.data.preferences;

      // 2. Save source-place context and preference vector in Neon.
      let sessionData = {
        source: {
          sourceNeighborhood,
          sourceCity: "",
          likes,
          dislikes: "",
          mobilityPreference,
          nearbyPriorities,
          dailyLifeNotes,
          lifestylePicks,
          tradeoffs,
        },
        preferences: extractedPrefs,
        budgetMin,
        budgetMax,
        citySlug: destCitySlug,
        profileId: undefined as string | undefined,
      };

      try {
        const profileRes = await fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });
        const profilePayload = await profileRes.json();
        sessionData = {
          ...sessionData,
          profileId: profilePayload.data?.profileId,
        };
      } catch (profileError) {
        console.error("Profile save failed:", profileError);
      }

      // 3. Save in client local storage for fast results-page rendering.
      localStorage.setItem("polaris_onboarding", JSON.stringify(sessionData));

      if (onComplete) {
        onComplete(sessionData);
      } else {
        router.push(`/results?city=${destCitySlug}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback preferences in case of failure (neutral 0.5 vector)
      const sessionData = {
        source: {
          sourceNeighborhood,
          sourceCity: "",
          likes,
          dislikes: "",
          mobilityPreference,
          nearbyPriorities,
          dailyLifeNotes,
          lifestylePicks,
          tradeoffs,
        },
        preferences: {
          walkability: 0.5,
          transit: 0.5,
          nightlife: 0.5,
          safety: 0.5,
          cafes: 0.5,
          parks: 0.5,
          young_professionals: 0.5,
          affordability: 0.5,
          diversity: 0.5,
        },
        budgetMin,
        budgetMax,
        citySlug: destCitySlug,
      };
      try {
        const profileRes = await fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });
        const profilePayload = await profileRes.json();
        localStorage.setItem(
          "polaris_onboarding",
          JSON.stringify({
            ...sessionData,
            profileId: profilePayload.data?.profileId,
          }),
        );
      } catch (profileError) {
        console.error("Profile save failed:", profileError);
        localStorage.setItem("polaris_onboarding", JSON.stringify(sessionData));
      }
      router.push(`/results?city=${destCitySlug}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper for progress bar
  const percent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  const revealItems = useMemo(
    () => [
      `Moving to ${currentCityConfig.name}`,
      `Old-place signal: ${sourceNeighborhood}`,
      `${lifestylePicks.length || 0} lifestyle cues selected`,
      `${nearbyPriorities.length || 0} nearby priorities selected`,
      `${tradeoffs.length || 0} tradeoffs accepted`,
    ],
    [
      currentCityConfig.name,
      sourceNeighborhood,
      lifestylePicks.length,
      nearbyPriorities.length,
      tradeoffs.length,
    ],
  );

  useEffect(() => {
    if (
      step === TOTAL_STEPS &&
      revealProgress === revealItems.length &&
      !autoSubmitted &&
      !loading
    ) {
      setAutoSubmitted(true);
      void handleSubmit();
    }
  }, [autoSubmitted, loading, revealProgress, revealItems.length, step]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[28px] p-5 sm:p-6 shadow-soft-xl relative overflow-hidden transition-all duration-500 ring-1 ring-slate-100">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: Destination City */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 1 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-3">
              Where are you moving?
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              Pick one of the cities we support right now.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CITIES.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => handleCitySelect(city.slug)}
                  className={`rounded-2xl p-4 text-left transition-all duration-300 ${
                    destCitySlug === city.slug
                      ? "bg-blue-500 text-white shadow-brand scale-[1.03] -rotate-1"
                      : "bg-slate-50 hover:bg-blue-50 hover:scale-[1.02] hover:-rotate-1"
                  }`}
                >
                  <h3 className={`text-lg font-bold ${destCitySlug === city.slug ? "text-white" : "text-slate-900"}`}>{city.name}</h3>
                  <span className={`text-xs block mb-2 ${destCitySlug === city.slug ? "text-white/80" : "text-slate-500"}`}>{city.country}</span>
                  <p className={`text-xs leading-relaxed ${destCitySlug === city.slug ? "text-white/90" : "text-slate-500"}`}>{city.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Source Neighborhood */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 2 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-2">
              Tell us one place you liked living.
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              This gives the match engine a real-life signal instead of starting from generic preferences.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">Previous neighborhood or area</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala, Bangalore or Lincoln Park, Chicago"
                  value={sourceNeighborhood}
                  onChange={(e) => setSourceNeighborhood(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl px-4 py-3 text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">What made it work for you?</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Walkable, great coffee shops, easy transit, young crowd, parks nearby..."
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl p-4 text-slate-900 outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Lifestyle and Daily Routine */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 3 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-2">
              What should daily life feel like?
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              Pick the vibe and practical anchors you want near home.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">Neighborhood vibe</label>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map((option) => {
                    const selected = lifestylePicks.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleLifestylePick(option)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? "bg-blue-600 text-white shadow-brand"
                            : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">Useful places nearby</label>
                <div className="flex flex-wrap gap-2">
                  {NEARBY_PRIORITY_OPTIONS.map((option) => {
                    const selected = nearbyPriorities.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleNearbyPriority(option)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? "bg-teal-500 text-white shadow-[0_8px_22px_rgba(20,184,166,0.22)]"
                            : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-600 text-sm mb-2 font-medium">How do you prefer getting around?</label>
                  <div className="flex flex-wrap gap-2">
                    {MOBILITY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMobilityPreference(option)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          mobilityPreference === option
                            ? "bg-blue-600 text-white shadow-brand"
                            : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">What should weekends and normal errands feel like?</label>
                <textarea
                  rows={3}
                  placeholder="e.g. I want groceries nearby, low-stress transit, casual dinner spots, and a few places to explore on weekends."
                  value={dailyLifeNotes}
                  onChange={(e) => setDailyLifeNotes(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl p-4 text-slate-900 outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Budget and Tradeoffs */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 4 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-2">
              Budget and tradeoffs.
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              The best match is usually a smart compromise, not a perfect fantasy.
            </p>

            <div className="bg-blue-50 rounded-3xl p-5 mb-6 text-center ring-1 ring-blue-100">
              <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Rent range filter</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {currentCityConfig.symbol}{budgetMin.toLocaleString()} – {currentCityConfig.symbol}{budgetMax.toLocaleString()}
                <span className="text-xs text-slate-500 ml-1.5">/month</span>
              </div>
            </div>

            <div className="space-y-6 px-2">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                  <span>Min Budget</span>
                  <span>{currentCityConfig.symbol}{budgetMin.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={currentCityConfig.minBound}
                  max={budgetMax - currentCityConfig.step}
                  step={currentCityConfig.step}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                  <span>Max Budget</span>
                  <span>{currentCityConfig.symbol}{budgetMax.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={budgetMin + currentCityConfig.step}
                  max={currentCityConfig.maxBound}
                  step={currentCityConfig.step}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-slate-600 text-sm mb-2 font-medium">What tradeoffs are you okay with?</label>
              <div className="flex flex-wrap gap-2">
                {TRADEOFF_OPTIONS.map((option) => {
                  const selected = tradeoffs.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleTradeoff(option)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        selected
                          ? "bg-slate-900 text-white shadow-soft"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Reveal */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 5 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-2">
              Your relocation profile is ready.
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              Polaris will rank neighborhoods, check budget fit, and surface practical places nearby.
            </p>
            <div className="relative grid gap-3 overflow-hidden rounded-3xl bg-slate-50 p-3">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200" aria-hidden />
              <div
                className="absolute left-6 top-8 w-0.5 origin-top bg-emerald-500 transition-all duration-300 ease-out"
                style={{
                  height: `${Math.max(0, ((revealProgress - 1) / 4) * 100)}%`,
                  maxHeight: "calc(100% - 4rem)",
                }}
                aria-hidden
              />
              {revealItems.map((item, index) => {
                const complete = revealProgress > index;
                const active = revealProgress === index;

                return (
                  <div
                    key={item}
                    className={`relative z-10 flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                      complete
                        ? "reveal-pop bg-emerald-50 shadow-soft-sm ring-1 ring-emerald-100"
                        : active
                          ? "bg-white ring-1 ring-blue-100"
                          : "bg-white/70"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300 ${
                        complete
                          ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]"
                          : active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {complete ? "OK" : index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        complete ? "text-emerald-900" : "text-slate-700"
                      }`}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${(revealProgress / revealItems.length) * 100}%` }}
              />
            </div>

            <p className="mt-3 text-center text-xs font-semibold text-slate-500">
              {revealProgress === revealItems.length
                ? "Opening your matches..."
                : "Building your neighborhood match profile..."}
            </p>
          </div>
        )}

        {/* Buttons Panel */}
        <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-100">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
                disabled={loading}
              >
                ← Back
              </button>
            )}
          </div>

          <div>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  step === 2 && (!sourceNeighborhood.trim() || !likes.trim())
                }
                className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-7 py-3 rounded-full shadow-brand transition-all"
              >
                Continue →
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-brand">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                {loading ? "Finding equivalent vibes..." : "Building profile..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
