"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { JobCard } from "./Card";
import { JobTokFilters } from "./Filters";

type Job = {
  refnr: string;
  titel: string;
  arbeitgeber: string;
  plz?: string;
  ort?: string;
  region?: string;
  beruf: string;
  eintrittsdatum: string;
  aktuelleVeroeffentlichungsdatum: string;
  stellenbeschreibung: string;
};

export function JobTokFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [wo, setWo] = useState("");
  const [was, setWas] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchJobs = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          size: "10",
          page: String(pageNum),
          ...(wo && { wo }),
          ...(was && { was }),
        });
        const res = await fetch(`/api/jobs?${params}`);
        const data = await res.json();
        const newJobs: Job[] = data.stellenangebote ?? [];
        setJobs((prev) => (reset ? newJobs : [...prev, ...newJobs]));
      } finally {
        setLoading(false);
      }
    },
    [wo, was]
  );

  // Сброс при смене фильтров
  useEffect(() => {
    setPage(0);
    setCurrent(0);
    fetchJobs(0, true);
  }, [wo, was]);

  // Подгрузка когда осталось 3 карточки
  useEffect(() => {
    if (jobs.length > 0 && current >= jobs.length - 3 && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage);
    }
  }, [current, jobs.length, loading]);

  // Scroll snap — следим за текущей карточкой
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => {
      const idx = Math.round(container.scrollTop / window.innerHeight);
      setCurrent(idx);
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="flex flex-col bg-black"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Фильтры */}
      <JobTokFilters wo={wo} was={was} onWo={setWo} onWas={setWas} />

      {/* Лента */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        {jobs.map((job, i) => (
          <div
            key={job.refnr}
            style={{ scrollSnapAlign: "start", height: "100dvh" }}
          >
            <JobCard job={job} active={i === current} />
          </div>
        ))}

        {loading && (
          <div className="flex h-24 items-center justify-center text-white/50">
            Laden…
          </div>
        )}
      </div>
    </div>
  );
}
