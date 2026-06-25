"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_TEST_CASE_ID, QUIZ_TEST_CASES, getQuizTestCase } from "@/lib/quiz-test-cases";

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
    desc: "Dense, walkable, always on.",
  },
  {
    name: "Toronto",
    slug: "toronto",
    country: "Canada",
    currency: "CAD",
    symbol: "C$",
    defaultMin: 1500,
    defaultMax: 3500,
    minBound: 1000,
    maxBound: 6000,
    step: 100,
    desc: "Diverse, practical, park-rich.",
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    country: "India",
    currency: "INR",
    symbol: "₹",
    defaultMin: 40000,
    defaultMax: 150000,
    minBound: 20000,
    maxBound: 300000,
    step: 5000,
    desc: "Coastal, social, high-energy.",
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

function CitySilhouette({ slug }: { slug: string }) {
  if (slug === "toronto") {
    return (
      <svg viewBox="0 0 180 64" className="h-16 w-44" aria-hidden="true">
        <path d="M8 54h164v7H8z" fill="currentColor" />
        <path d="M24 34h16v20H24zM47 26h18v28H47zM72 38h14v16H72zM94 20h15v34H94zM118 31h17v23h-17zM143 39h13v15h-13z" fill="currentColor" />
        <path d="M88 54h10l4-36 3-5 3 5 4 36h10l-9-39h-5l-3-12-3 12h-5z" fill="currentColor" />
        <path d="M97 23h16v4H97z" fill="currentColor" />
      </svg>
    );
  }

  if (slug === "mumbai") {
    return (
      <svg viewBox="0 0 180 64" className="h-16 w-44" aria-hidden="true">
        <path d="M8 54h164v7H8z" fill="currentColor" />
        <path d="M36 28h108v26H36z" fill="currentColor" />
        <path d="M48 18h20v10H48zM112 18h20v10h-20z" fill="currentColor" />
        <path d="M54 10l12 8H42zM126 10l12 8h-24zM90 8l22 20H68z" fill="currentColor" />
        <path d="M75 54V37c0-8 6-15 15-15s15 7 15 15v17H75z" fill="white" opacity="0.72" />
        <path d="M48 38h10v16H48zM122 38h10v16h-10z" fill="white" opacity="0.72" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 64" className="h-16 w-44" aria-hidden="true">
      <path d="M8 54h164v7H8z" fill="currentColor" />
      <path d="M22 35h14v19H22zM42 25h18v29H42zM66 32h14v22H66zM86 12h16v42H86zM108 29h18v25h-18zM132 20h17v34h-17zM154 38h12v16h-12z" fill="currentColor" />
      <path d="M91 12l3-10 3 10z" fill="currentColor" />
      <path d="M42 21h18v4H42zM132 16h17v4h-17z" fill="currentColor" />
    </svg>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const seededTestCase = getQuizTestCase(DEFAULT_TEST_CASE_ID);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(seededTestCase.id);
  const [showDevOptions, setShowDevOptions] = useState(false);

  // Form State
  const [destCitySlug, setDestCitySlug] = useState<string>(seededTestCase.citySlug);
  const [sourceNeighborhood, setSourceNeighborhood] = useState(seededTestCase.sourcePlace);
  const [likes, setLikes] = useState(seededTestCase.likes);
  const [lifestylePicks, setLifestylePicks] = useState<string[]>(seededTestCase.lifestylePicks);
  const [mobilityPreference, setMobilityPreference] = useState(seededTestCase.mobilityPreference);
  const [nearbyPriorities, setNearbyPriorities] = useState<string[]>(seededTestCase.nearbyPriorities);
  const [dailyLifeNotes, setDailyLifeNotes] = useState(seededTestCase.usefulPlacesNearby);
  const [tradeoffs, setTradeoffs] = useState<string[]>(seededTestCase.tradeoffs);
  
  // Budget values
  const currentCityConfig = CITIES.find((c) => c.slug === destCitySlug) || CITIES[0];
  const [budgetMin, setBudgetMin] = useState(seededTestCase.budgetMin);
  const [budgetMax, setBudgetMax] = useState(seededTestCase.budgetMax);

  const handleCitySelect = (slug: string) => {
    setDestCitySlug(slug);
    const config = CITIES.find((c) => c.slug === slug)!;
    setBudgetMin(config.defaultMin);
    setBudgetMax(config.defaultMax);
  };

  const applyTestCase = (testCaseId: string) => {
    const testCase = getQuizTestCase(testCaseId);
    setSelectedTestCaseId(testCase.id);
    setDestCitySlug(testCase.citySlug);
    setSourceNeighborhood(testCase.sourcePlace);
    setLikes(testCase.likes);
    setLifestylePicks(testCase.lifestylePicks);
    setMobilityPreference(testCase.mobilityPreference);
    setNearbyPriorities(testCase.nearbyPriorities);
    setDailyLifeNotes(testCase.usefulPlacesNearby);
    setTradeoffs(testCase.tradeoffs);
    setBudgetMin(testCase.budgetMin);
    setBudgetMax(testCase.budgetMax);
    setAutoSubmitted(false);
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
        : [...current, priority]
    );
  };

  const toggleLifestylePick = (pick: string) => {
    setLifestylePicks((current) =>
      current.includes(pick)
        ? current.filter((item) => item !== pick)
        : [...current, pick]
    );
  };

  const toggleTradeoff = (tradeoff: string) => {
    setTradeoffs((current) =>
      current.includes(tradeoff)
        ? current.filter((item) => item !== tradeoff)
        : [...current, tradeoff]
    );
  };

  useEffect(() => {
    if (step !== TOTAL_STEPS) {
      setAutoSubmitted(false);
      return;
    }

    if (!autoSubmitted && !loading) {
      setAutoSubmitted(true);
      void handleSubmit();
    }
  }, [autoSubmitted, loading, step]);

  const handleSubmit = async () => {
    setLoading(true);
    
    // For Mumbai, convert budget back to USD database scale (divided by 83)
    const finalBudgetMin = destCitySlug === "mumbai" ? Math.round(budgetMin / 83) : budgetMin;
    const finalBudgetMax = destCitySlug === "mumbai" ? Math.round(budgetMax / 83) : budgetMax;

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
        budgetMin: finalBudgetMin,
        budgetMax: finalBudgetMax,
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
        budgetMin: finalBudgetMin,
        budgetMax: finalBudgetMax,
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
          })
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
              Select your destination city to align currency and budget standards.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CITIES.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => handleCitySelect(city.slug)}
                  className={`relative min-h-[150px] overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                    destCitySlug === city.slug
                      ? "bg-blue-500 text-white shadow-brand scale-[1.03] -rotate-1"
                      : "bg-slate-50 hover:bg-blue-50 hover:scale-[1.02] hover:-rotate-1"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -bottom-6 -right-8 ${
                      destCitySlug === city.slug ? "text-white/18" : "text-slate-300/70"
                    }`}
                  >
                    <CitySilhouette slug={city.slug} />
                  </div>
                  <div className="relative z-10 max-w-[8.5rem]">
                    <h3 className={`text-lg font-bold ${destCitySlug === city.slug ? "text-white" : "text-slate-900"}`}>{city.name}</h3>
                    <span className={`text-xs block mb-2 ${destCitySlug === city.slug ? "text-white/80" : "text-slate-500"}`}>{city.country}</span>
                    <p className={`text-xs leading-relaxed ${destCitySlug === city.slug ? "text-white/90" : "text-slate-500"}`}>{city.desc}</p>
                  </div>
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

            <div className="px-2">
              <div className="flex justify-between text-xs text-slate-500 mb-3 font-medium">
                <span>Min {currentCityConfig.symbol}{budgetMin.toLocaleString()}</span>
                <span>Max {currentCityConfig.symbol}{budgetMax.toLocaleString()}</span>
              </div>

              <div className="dual-range-slider relative h-8">
                <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                <div
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-600"
                  style={{
                    left: `${((budgetMin - currentCityConfig.minBound) / (currentCityConfig.maxBound - currentCityConfig.minBound)) * 100}%`,
                    right: `${100 - ((budgetMax - currentCityConfig.minBound) / (currentCityConfig.maxBound - currentCityConfig.minBound)) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={currentCityConfig.minBound}
                  max={currentCityConfig.maxBound}
                  step={currentCityConfig.step}
                  value={budgetMin}
                  onChange={(e) =>
                    setBudgetMin(Math.min(Number(e.target.value), budgetMax - currentCityConfig.step))
                  }
                  className="absolute left-0 top-1/2 z-20 w-full -translate-y-1/2"
                  aria-label="Minimum rent budget"
                />
                <input
                  type="range"
                  min={currentCityConfig.minBound}
                  max={currentCityConfig.maxBound}
                  step={currentCityConfig.step}
                  value={budgetMax}
                  onChange={(e) =>
                    setBudgetMax(Math.max(Number(e.target.value), budgetMin + currentCityConfig.step))
                  }
                  className="absolute left-0 top-1/2 z-30 w-full -translate-y-1/2"
                  aria-label="Maximum rent budget"
                />
              </div>

              <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>{currentCityConfig.symbol}{currentCityConfig.minBound.toLocaleString()}</span>
                <span>{currentCityConfig.symbol}{currentCityConfig.maxBound.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6">
              <div>
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
          </div>
        )}

        {/* STEP 5: Loading */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 5 of 5</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 mb-2">
              Looking for your new home base.
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              We are comparing your old-place signal, budget, and everyday routines against neighborhoods in {currentCityConfig.name}.
            </p>
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-8 text-center">
              <span className="mb-5 h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <h3 className="text-lg font-bold text-slate-900">
                Finding neighborhoods that feel like a fit.
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Checking lifestyle fit, rent range, transit, and useful places nearby.
              </p>
            </div>
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

      {step < TOTAL_STEPS && (
        <div className="fixed bottom-3 right-3 z-50 text-right">
          {showDevOptions && (
            <div className="mb-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white/95 p-3 text-left shadow-soft-xl backdrop-blur">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Testing preset
              </label>
              <select
                value={selectedTestCaseId}
                onChange={(event) => applyTestCase(event.target.value)}
                className="w-full rounded-xl border-2 border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white"
                aria-label="Load a quiz test case"
              >
                {QUIZ_TEST_CASES.map((testCase) => (
                  <option key={testCase.id} value={testCase.id}>
                    {testCase.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowDevOptions((value) => !value)}
            className="text-[10px] font-semibold text-slate-300 transition-colors hover:text-slate-500"
            aria-expanded={showDevOptions}
          >
            dev
          </button>
        </div>
      )}
    </div>
  );
}
