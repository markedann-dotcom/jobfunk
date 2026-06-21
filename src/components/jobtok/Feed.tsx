"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { JobCard } from "./Card";
import { LandSelect, BUNDESLAENDER } from "./LandSelect";
import type { JobListItem } from "@/lib/api";
import { useT } from "@/lib/i18n";

const LAND_KEY = "jf_jobtok_land";

function saveLand(v: string) {
  try { localStorage.setItem(LAND_KEY, v); } catch {}
}
function loadLand(): string | null {
  try { return localStorage.getItem(LAND_KEY); } catch { return null; }
}

export function JobTokFeed() {
  const { lang } = useT();
  const [land, setLand] = useState<string | null>(null); // null = show picker
  const [showPicker, setShowPicker] = useState(false);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFetched = useRef<string>("");

  // On mount — restore land from localStorage, else show picker
  useEffect(() => {
    const saved = loadLand();
    if (saved) {
      setLand(saved);
    } else {
      setShowPicker(true);
    }
  }, []);

  // Lock page scroll when feed is open
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("jobtok-open");
    return () => html.classList.remove("jobtok-open");
  }, []);

  const handleSelectLand = useCallback((code: string) => {
    saveLand(code);
    setLand(code);
    setShowPicker(false);
  }, []);

  // Map land → wo param for API
  const landToWo = (code: string): string => {
    if (code === "all" || !code) return "";
    return code;
  };

  const fetchJobs = useCallback(
    async (pageNum: number, reset = false) => {
      if (!land) return;
      const wo = landToWo(land);
      const sig = `${wo}|${pageNum}`;
      if (lastFetched.current === sig && !reset) return;
      lastFetched.current = sig;

      setLoading(true);
      try {
        const params = new URLSearchParams({ size: "12", page: String(pageNum) });
        if (wo) params.set("wo", wo);

        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) throw new Error("fetch_failed");
        const data = await res.json();
        const newJobs: JobListItem[] = data.jobs ?? [];

        setJobs((prev) => {
          if (reset) return newJobs;
          const seen = new Set(prev.map((j) => j.refnr));
          return [...prev, ...newJobs.filter((j) => !seen.has(j.refnr))];
        });
        if (newJobs.length === 0) setDone(true);
      } catch {
        if (reset) setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [land]
  );

  // Reset + fetch when land changes
  useEffect(() => {
    if (!land) return;
    setPage(1);
    setCurrent(0);
    setDone(false);
    lastFetched.current = "";
    fetchJobs(1, true);
    containerRef.current?.scrollTo({ top: 0 });
  }, [land, fetchJobs]);

  // Infinite load when 3 cards from the end
  useEffect(() => {
    if (loading || done) return;
    if (jobs.length > 0 && current >= jobs.length - 3) {
      const next = page + 1;
      setPage(next);
      fetchJobs(next);
    }
  }, [current, jobs.length, loading, done, page, fetchJobs]);

  // Track active card via scroll snap
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollTop / el.clientHeight);
        setCurrent((c) => (c === idx ? c : idx));
      });
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => { el.removeEventListener("scroll", handler); cancelAnimationFrame(raf); };
  }, []);

  const landLabel = land
    ? (BUNDESLAENDER.find((b) => b.code === land)?.[lang === "uk" ? "uk" : "de"] ?? land)
    : "";

  // Show picker screen
  if (showPicker || !land) {
    return <LandSelect lang={lang} onSelect={handleSelectLand} />;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        backgroundImage: "url('/jobtok-feed-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        background: "var(--color-page)",
      }}
    >
      {/* Subtle textured feed bg */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/jobtok-feed-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.55,
        }}
        aria-hidden
      />

      {/* Top bar: close + land chip */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-page) 90%, transparent) 0%, color-mix(in srgb, var(--color-page) 50%, transparent) 60%, transparent 100%)",
        }}
      >
        {/* Close */}
        <Link
          href="/"
          aria-label="Schließen"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full backdrop-blur-sm transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Brand */}
        <span
          className="text-base font-black tracking-tight"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}
        >
          Job<span style={{ color: "var(--color-accent)" }}>Tok</span>
        </span>

        <div className="flex-1" />

        {/* Land chip — click to change */}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface)/80)",
            borderColor: "color-mix(in srgb, var(--color-accent) 35%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: "var(--color-accent)" }}>
            <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
            <circle cx="12" cy="10.5" r="2.2" />
          </svg>
          <span className="max-w-[120px] truncate">{landLabel}</span>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress indicator */}
        {jobs.length > 0 && (
          <span className="rounded-full px-2 py-1 text-[11px] font-bold backdrop-blur-sm"
            style={{
              background: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
              color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
            }}
          >
            {current + 1}/{jobs.length}
          </span>
        )}
      </div>

      {/* Feed */}
      <div ref={containerRef} className="jobtok-scroll relative z-10">
        {jobs.map((job, i) => (
          <div key={job.refnr} className="jobtok-slide w-full">
            <JobCard job={job} active={i === current} index={i} />
          </div>
        ))}

        {jobs.length === 0 && (
          <div
            className="jobtok-slide flex w-full flex-col items-center justify-center gap-3 px-8 text-center"
            style={{ color: "var(--color-ink)" }}
          >
            {loading ? (
              <>
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-current/20 border-t-orange-500" />
                <p className="text-sm opacity-50">Lade Jobs…</p>
              </>
            ) : (
              <>
                <div className="grid h-16 w-16 place-items-center rounded-2xl"
                  style={{ background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}>
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--color-accent)" }}>
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-lg font-bold">Keine Jobs gefunden</p>
                <button
                  onClick={() => setShowPicker(true)}
                  className="mt-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition active:scale-95"
                  style={{ background: "var(--color-accent)" }}
                >
                  Bundesland wechseln
                </button>
              </>
            )}
          </div>
        )}

        {jobs.length > 0 && loading && (
          <div className="flex h-20 items-center justify-center opacity-40">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-current/20 border-t-orange-500" />
          </div>
        )}
      </div>

      {/* Scroll hint on first slide */}
      {current === 0 && jobs.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] inset-x-0 z-20 flex flex-col items-center gap-1 animate-bounce"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-30" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-ink)" }}>
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-medium opacity-30" style={{ color: "var(--color-ink)" }}>
            {lang === "de" ? "Weiter scrollen" : "Гортай далі"}
          </span>
        </div>
      )}
    </div>
  );
}
