"use client";

import Onboarding from "./Onboarding";

// ─── Sub-components ───────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] font-medium px-3.5 py-1.5 rounded-full mb-8 select-none"
      aria-label="AI-powered neighborhood discovery"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[pulseRing_2s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      AI neighborhood agent
    </div>
  );
}

// ─── Main Hero Component ──────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative min-h-[100svh] flex flex-col justify-center pt-24 pb-16 px-5 sm:px-6 overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_700px_at_70%_-5%,rgba(59,130,246,0.10)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_500px_at_-5%_90%,rgba(14,184,166,0.07)_0%,transparent_65%)]" />
        {/* Warm horizontal light stripe */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <AIBadge />

        <h1
          id="hero-headline"
          className="text-[clamp(34px,6.5vw,60px)] font-extralight leading-[1.07] tracking-[-0.03em] text-slate-900 mb-5"
        >
          Find the neighborhood<br />
          that{" "}
          <em className="font-display font-light not-italic text-blue-600">
            fits your life
          </em>
        </h1>

        <p className="text-[clamp(14px,1.8vw,16px)] text-slate-500 max-w-[500px] mx-auto mb-10 leading-relaxed font-light">
          Describe how you live. Our lifestyle matching engine matches you with the equivalent neighborhood in your new city.
        </p>

        {/* ── Onboarding Multi-step Form ── */}
        <div id="search" className="text-left">
          <Onboarding />
        </div>
      </div>
    </section>
  );
}
