"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { JobCard } from "./Card";
import { JobTokFilters } from "./Filters";
import type { JobListItem } from "@/lib/api";

export function JobTokFeed() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [current, setCurrent] = useState(0);
  const [wo, setWo] = useState("");
  const [was, setWas] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  // guard so the same page is never fetched twice (StrictMode / rapid scroll)
  const lastFetched = useRef<string>("");

  const fetchJobs = useCallback(
    async (pageNum: number, reset = false) => {
      const sig = `${was}|${wo}|${pageNum}`;
      if (lastFetched.current === sig && !reset) return;
      lastFetched.current = sig;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          size: "12",
          page: String(pageNum),
        });
        if (wo) params.set("wo", wo);
        if (was) params.set("was", was);

        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) throw new Error("fetch_failed");
        const data = await res.json();
        const newJobs: JobListItem[] = data.jobs ?? [];

        setJobs((prev) => {
          if (reset) return newJobs;
          // de-dupe by refnr
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
    [wo, was]
  );

  // Reset whenever filters change (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setCurrent(0);
      setDone(false);
      lastFetched.current = "";
      fetchJobs(1, true);
      containerRef.current?.scrollTo({ top: 0 });
    }, 400);
    return () => clearTimeout(t);
  }, [wo, was, fetchJobs]);

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
    const handler = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setCurrent((c) => (c === idx ? c : idx));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Top bar: close + filters */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        <Link
          href="/"
          aria-label="Schließen"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>
        <JobTokFilters wo={wo} was={was} onWo={setWo} onWas={setWas} />
      </div>

      {/* Feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll overscroll-contain"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        {jobs.map((job, i) => (
          <div
            key={job.refnr}
            className="w-full"
            style={{ scrollSnapAlign: "start", height: "100dvh" }}
          >
            <JobCard job={job} active={i === current} />
          </div>
        ))}

        {/* Empty / loading states get their own full screen so snap stays clean */}
        {jobs.length === 0 && (
          <div
            className="flex w-full flex-col items-center justify-center gap-3 px-8 text-center"
            style={{ height: "100dvh" }}
          >
            {loading ? (
              <>
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
                <p className="text-sm text-white/50">Lade Jobs…</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-white">Keine Jobs gefunden</p>
                <p className="text-sm text-white/50">
                  Passe deine Suche an oder versuche es später erneut.
                </p>
              </>
            )}
          </div>
        )}

        {jobs.length > 0 && loading && (
          <div className="flex h-20 items-center justify-center text-white/40">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
          </div>
        )}
      </div>
    </div>
  );
}
