"use client";

import { useEffect, useState } from "react";

export function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Nach oben"
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
      className="group fixed right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface text-ink shadow-[0_12px_34px_-8px_rgba(60,40,20,0.4)] transition hover:border-accent hover:text-accent lg:!bottom-5"
    >
      {/* rotating circular brand text */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full animate-[spin_9s_linear_infinite] text-muted transition-colors group-hover:text-accent"
        aria-hidden
      >
        <defs>
          <path
            id="jf-circle"
            d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          />
        </defs>
        <text className="fill-current" style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "2.2px" }}>
          <textPath href="#jf-circle" startOffset="0%">
            · JOBFUNKE · NACH OBEN
          </textPath>
        </text>
      </svg>

      {/* center arrow */}
      <svg
        viewBox="0 0 24 24"
        className="relative h-5 w-5 transition-transform group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden
      >
        <path d="m6 14 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
