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
  const [land, setLand] = useState<string | null>(null);
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

  // Keyboard navigation: Arrow Up/Down or J/K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showPicker) return;
      const el = containerRef.current;
      if (!el) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = Math.min(current + 1, jobs.length - 1);
        el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = Math.max(current - 1, 0);
        el.scrollTo({ top: prev * el.clientHeight, behavior: "smooth" });
      } else if (e.key === "Escape") {
        window.location.href = "/";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, jobs.length, showPicker]);

  const handleSelectLand = useCallback((code: string) => {
    saveLand(code);
    setLand(code);
    setShowPicker(false);
  }, []);

  const landToWo = (code: string): string =>
    code === "all" || !code ? "" : code;

  const fetchJobs = useCallback(
    async (pageNum: number, reset = false) => {
      if (!land) return;
      const wo = landToWo(land);
      const sig = `${wo}|${pageNum}`;
      if (lastFetched.current === sig && !reset) return;
      lastFetched.current = sig;

      setLoading(true);
      try {
        const params = new URLSearchParams({ size: "15", page: String(pageNum) });
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
        if (newJobs.length < 15) setDone(true);
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

  // Infinite load: 4 cards from end
  useEffect(() => {
    if (loading || done) return;
    if (jobs.length > 0 && current >= jobs.length - 4) {
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
    return () => {
      el.removeEventListener("scroll", handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  const landEntry = BUNDESLAENDER.find((b) => b.code === land);
  const landLabel = landEntry ? landEntry[lang === "uk" ? "uk" : "de"] : (land ?? "");
  const landShort = landEntry?.short ?? "DE";

  // Show picker
  if (showPicker || !land) {
    return <LandSelect lang={lang} onSelect={handleSelectLand} />;
  }

  return (
    <div
      className="jobtok-root fixed inset-0 z-[100] flex flex-col"
      style={{ background: "var(--color-page)" }}
    >
      {/* Subtle feed background */}
      <div
        className="jobtok-feed-bg pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/jobtok-feed-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
        }}
        aria-hidden
      />

      {/* Top bar */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-page) 94%, transparent) 0%, color-mix(in srgb, var(--color-page) 60%, transparent) 70%, transparent 100%)",
        }}
      >
        {/* Close */}
        <Link
          href="/"
          aria-label="Schließen"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-ink) 9%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Brand */}
        <span
          className="text-[17px] font-black tracking-tight"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}
        >
          Job<span style={{ color: "var(--color-accent)" }}>Tok</span>
        </span>

        {/* Keyboard hint — desktop only */}
        <span
          className="hidden items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium lg:flex"
          style={{
            background: "color-mix(in srgb, var(--color-ink) 6%, transparent)",
            color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
          }}
        >
          <kbd className="rounded px-1 font-mono text-[10px]">↑↓</kbd> navigieren
        </span>

        <div className="flex-1" />

        {/* Land chip */}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 10%, color-mix(in srgb, var(--color-surface) 85%, transparent))",
            borderColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <span
            className="grid h-4 w-6 shrink-0 place-items-center rounded text-[9px] font-black text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {landShort}
          </span>
          <span className="max-w-[110px] truncate">{landLabel}</span>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 opacity-40" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Counter */}
        {jobs.length > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
            style={{
              background: "color-mix(in srgb, var(--color-ink) 7%, transparent)",
              color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
            }}
          >
            {current + 1}/{jobs.length}
          </span>
        )}
      </div>

      {/* ---- FEED CONTAINER ---- */}
      {/* Desktop: center the cards with a nice max-width */}
      <div className="jobtok-desktop-frame relative z-10 flex h-full w-full items-stretch justify-center">
        {/* Left sidebar hint on desktop */}
        <div className="jobtok-sidebar-left hidden lg:flex lg:w-[calc((100%-520px)/2)] items-center justify-end pr-6">
          <div
            className="flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
            style={{
              background: "color-mix(in srgb, var(--color-ink) 4%, transparent)",
              color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-medium leading-tight">Pfeil hoch<br/>oder K</span>
            <div className="h-px w-8" style={{ background: "color-mix(in srgb, var(--color-ink) 15%, transparent)" }} />
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 19V5M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-medium leading-tight">Pfeil runter<br/>oder J</span>
          </div>
        </div>

        {/* Scroll container — constrained on desktop */}
        <div
          ref={containerRef}
          className="jobtok-scroll jobtok-card-pane"
        >
          {jobs.map((job, i) => (
            <div key={job.refnr} className="jobtok-slide w-full">
              <JobCard job={job} active={i === current} index={i} />
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="jobtok-slide flex w-full flex-col items-center justify-center gap-4 px-8 text-center">
              {loading ? (
                <>
                  <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-current/15 border-t-orange-500" />
                  <p className="text-sm opacity-40">Lade Jobs…</p>
                </>
              ) : (
                <>
                  <div
                    className="grid h-16 w-16 place-items-center rounded-2xl"
                    style={{ background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--color-accent)" }}>
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold">Keine Jobs gefunden</p>
                    <p className="mt-1 text-sm opacity-50">Versuche ein anderes Bundesland</p>
                  </div>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="mt-1 rounded-full px-6 py-2.5 text-sm font-bold text-white transition active:scale-95"
                    style={{ background: "var(--color-accent)" }}
                  >
                    Bundesland wechseln
                  </button>
                </>
              )}
            </div>
          )}

          {/* Load more spinner */}
          {jobs.length > 0 && loading && (
            <div className="flex h-24 items-center justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current/15 border-t-orange-500 opacity-50" />
            </div>
          )}
        </div>

        {/* Right sidebar on desktop: progress dots */}
        <div className="jobtok-sidebar-right hidden lg:flex lg:w-[calc((100%-520px)/2)] items-center justify-start pl-6">
          <div className="flex flex-col gap-1.5">
            {jobs.slice(Math.max(0, current - 4), current + 8).map((job, relIdx) => {
              const absIdx = Math.max(0, current - 4) + relIdx;
              const isActive = absIdx === current;
              return (
                <button
                  key={job.refnr}
                  onClick={() => {
                    const el = containerRef.current;
                    if (el) el.scrollTo({ top: absIdx * el.clientHeight, behavior: "smooth" });
                  }}
                  aria-label={`Job ${absIdx + 1}`}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? "32px" : "8px",
                    height: "8px",
                    background: isActive
                      ? "var(--color-accent)"
                      : "color-mix(in srgb, var(--color-ink) 20%, transparent)",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll hint removed — was too annoying */}
    </div>
  );
}
