"use client";

import Onboarding from "./Onboarding";

// ─── Main Hero Component ──────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative min-h-[100svh] flex flex-col justify-center pt-16 pb-5 px-4 sm:px-6 overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Funky, colorful organic blobs — soft, never harsh boxes */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="blob-mask absolute -top-16 -left-10 w-72 h-72 bg-blue-200/50 animate-float" />
        <div className="blob-mask absolute top-10 -right-16 w-80 h-80 bg-sky-200/50" />
        <div className="blob-mask absolute -bottom-20 left-1/4 w-72 h-72 bg-rose-100/60 animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <h1
          id="hero-headline"
          className="text-[clamp(32px,5.4vw,56px)] font-bold leading-[1.02] tracking-[-0.03em] text-slate-900 mb-3"
        >
          Find the neighborhood<br />
          that{" "}
          <em className="font-display not-italic text-blue-600 relative inline-block">
            fits your life
            <span className="absolute left-0 -bottom-1 w-full h-2.5 bg-amber-400/70 rounded-full -z-10" aria-hidden="true" />
          </em>
        </h1>

        <p className="text-[clamp(14px,1.6vw,16px)] text-slate-600 max-w-[520px] mx-auto mb-5 leading-relaxed">
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
