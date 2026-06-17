"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { JobCard } from "./job-card";
import type { SearchResult } from "@/lib/api";

type Tab = { key: string; angebotsart: string };

const TABS: Tab[] = [
  { key: "featured.tab.new", angebotsart: "1" },
  { key: "featured.tab.ausbildung", angebotsart: "4" },
  { key: "featured.tab.minijob", angebotsart: "34" },
];

export function FeaturedJobs() {
  const { t } = useT();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    const art = TABS[tab].angebotsart;
    fetch(`/api/search?angebotsart=${art}&page=1&size=6`)
      .then((r) => {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then((d: SearchResult) => {
        if (!alive) return;
        setData(d);
        setStatus("ok");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [tab]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-black tracking-tight text-ink sm:text-3xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("featured.title")}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">{t("featured.sub")}</p>
        </div>
        <Link
          href="/suche?page=1"
          className="hidden items-center gap-1.5 text-sm font-bold text-accent transition hover:gap-2.5 sm:inline-flex"
        >
          {t("featured.all")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* tabs */}
      <div className="mt-5 inline-flex rounded-full border border-border bg-surface p-1">
        {TABS.map((tb, i) => (
          <button
            key={tb.key}
            onClick={() => setTab(i)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              i === tab ? "bg-accent text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {t(tb.key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {status === "loading" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
          </div>
        )}

        {status === "error" && (
          <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted">
            {t("results.error.sub")}
          </p>
        )}

        {status === "ok" && data && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.jobs.slice(0, 6).map((job, i) => (
              <JobCard key={job.refnr + i} job={job} idx={i} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/suche?page=1"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          {t("featured.all")}
        </Link>
      </div>
    </section>
  );
}
