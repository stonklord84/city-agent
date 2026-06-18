"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingProps {
  onComplete?: (data: {
    source: {
      sourceNeighborhood: string;
      sourceCity: string;
      likes: string;
      dislikes: string;
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

export default function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [sourceNeighborhood, setSourceNeighborhood] = useState("Atlanta, USA");
  const [likes, setLikes] = useState(
    "I liked the tree-lined neighborhoods, friendly energy, coffee shops, parks, good food, and that it felt social without being as intense as New York.",
  );
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
        }),
      });

      if (!res.ok) throw new Error("Preference extraction failed");

      const payload = await res.json();
      const extractedPrefs = payload.data.preferences;

      // 2. Save source-place context and preference vector in Neon.
      let sessionData = {
        source: { sourceNeighborhood, sourceCity: "", likes, dislikes: "" },
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
      localStorage.setItem("city_agent_onboarding", JSON.stringify(sessionData));

      if (onComplete) {
        onComplete(sessionData);
      } else {
        router.push(`/results?city=${destCitySlug}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback preferences in case of failure (neutral 0.5 vector)
      const sessionData = {
        source: { sourceNeighborhood, sourceCity: "", likes, dislikes: "" },
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
          "city_agent_onboarding",
          JSON.stringify({
            ...sessionData,
            profileId: profilePayload.data?.profileId,
          }),
        );
      } catch (profileError) {
        console.error("Profile save failed:", profileError);
        localStorage.setItem("city_agent_onboarding", JSON.stringify(sessionData));
      }
      router.push(`/results?city=${destCitySlug}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper for progress bar
  const percent = Math.round(((step - 1) / 2) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-soft-xl relative overflow-hidden transition-all duration-500">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="min-h-[360px] flex flex-col justify-between">
        {/* STEP 1: Destination City */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 1 of 3</span>
            <h2 className="text-3xl font-light text-slate-900 mt-2 mb-6">
              Where are you moving?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Pick one of the three cities we support right now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITIES.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => handleCitySelect(city.slug)}
                  className={`bg-white border-2 rounded-2xl p-5 text-left transition-all duration-300 shadow-sm ${
                    destCitySlug === city.slug
                      ? "border-blue-500 bg-blue-50 scale-[1.02]"
                      : "border-slate-200 hover:border-blue-200 hover:scale-[1.01]"
                  }`}
                >
                  <h3 className="text-lg font-medium text-slate-900">{city.name}</h3>
                  <span className="text-xs text-slate-500 block mb-3">{city.country}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{city.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Source Neighborhood */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 2 of 3</span>
            <h2 className="text-3xl font-light text-slate-900 mt-2 mb-6">
              Tell us one place you liked living.
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">Previous neighborhood or area</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala, Bangalore or Lincoln Park, Chicago"
                  value={sourceNeighborhood}
                  onChange={(e) => setSourceNeighborhood(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-900 outline-none transition-colors"
                />
              </div>
              <label className="block text-slate-600 text-sm mb-1.5 font-medium">What did you like about it?</label>
              <textarea
                rows={5}
                placeholder="e.g. Walkable, great coffee shops, easy transit, young crowd, parks nearby..."
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-4 text-slate-900 outline-none transition-colors resize-none leading-relaxed"
              />
            </div>
            <p className="text-xs text-slate-500 mt-6 leading-relaxed">
              One sentence is enough. We will keep uncertain preferences neutral and get you to results quickly.
            </p>
          </div>
        )}

        {/* STEP 3: Budget */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Step 3 of 3</span>
            <h2 className="text-3xl font-light text-slate-900 mt-2 mb-2">
              What&apos;s your monthly budget?
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Target rent range for your apartments in {currentCityConfig.name}.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-center">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Rent range filter</span>
              <div className="text-3xl font-light text-slate-900 mt-1">
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
          </div>
        )}

        {/* Buttons Panel */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
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
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  step === 2 && (!sourceNeighborhood.trim() || !likes.trim())
                }
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-8 py-3 rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Finding equivalent vibes…
                  </>
                ) : (
                  <>
                    Match Neighborhoods
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
