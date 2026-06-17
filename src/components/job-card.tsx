"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import type { JobListItem } from "@/lib/api";
import { jobExternalLink } from "@/lib/api";
import type { CSSProperties } from "react";
import { formatDate, isRecent, typeMeta, toneVar } from "@/lib/display";
import { useFavorites } from "@/lib/favorites";
import { ShareMenu } from "./share-menu";

export const JobCard = memo(function JobCard({ job, idx = 0 }: { job: JobListItem; idx?: number }) {
  const { t, lang } = useT();
  const { isFav, toggle } = useFavorites();
  const tm = typeMeta(job.angebotsart);
  const cvar = toneVar[tm.tone] ?? "amber";
  const toneStyle = {
    "--cc": `var(--c-${cvar})`,
    "--cc-soft": `var(--c-${cvar}-soft)`,
  } as CSSProperties;
  const location = [job.plz, job.ort].filter(Boolean).join(" ") || job.region || "—";
  const recent = isRecent(job.published);
  const fav = isFav(job.refnr);
  const initial = (job.arbeitgeber ?? job.titel ?? "?").trim().charAt(0).toUpperCase();

  return (
    <article
      className="fade-up group relative flex w-full min-w-0 flex-col rounded-2xl border border-border bg-surface/90 shadow-[0_2px_10px_-4px_rgba(60,40,20,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:[border-color:color-mix(in_srgb,var(--cc)_50%,transparent)] hover:shadow-[0_22px_48px_-18px_rgba(120,72,20,0.32)]"
      style={{ ...toneStyle, animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
    >
      <Link
        href={`/job/${encodeURIComponent(job.refnr)}`}
        aria-label={job.titel}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      />
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1.5 rounded-l-2xl" style={{ background: "var(--cc)" }} />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="flex items-start gap-3">
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-page text-base font-black text-ink/70"
            style={{ fontFamily: "var(--font-fraunces)" }}
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "var(--cc-soft)", color: "var(--cc)" }}>
                {t(tm.key)}
              </span>
              {recent && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {t("card.new")}
                </span>
              )}
              {job.entfernung && job.entfernung !== "0" && (
                <span className="rounded-full bg-page px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                  {Math.round(Number(job.entfernung))}&nbsp;km
                </span>
              )}
            </div>
            <h3
              title={job.titel}
              className="mt-2 line-clamp-2 text-[17px] font-bold leading-snug text-ink"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {job.titel}
            </h3>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(job); }}
            aria-label={fav ? t("fav.added") : t("fav.add")}
            aria-pressed={fav}
            className={`pointer-events-auto relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${
              fav
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-muted">
          {job.arbeitgeber && (
            <p className="flex items-center gap-2">
              <BuildingIcon />
              <span className="truncate font-medium text-ink/80" title={job.arbeitgeber}>
                {job.arbeitgeber}
              </span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <PinIcon />
            <span className="truncate" title={location}>{location}</span>
          </p>
          <p className="flex items-center gap-2">
            <ClockIcon />
            {t("card.published")}: <time dateTime={job.published}>{formatDate(job.published, lang)}</time>
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <span className="inline-flex flex-1 items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
            {t("card.details")}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <a
            href={jobExternalLink(job)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto relative z-10 inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            {t("card.goto")}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <span className="pointer-events-auto relative z-10">
            <ShareMenu refnr={job.refnr} title={job.titel} company={job.arbeitgeber} drop="up" />
          </span>
        </div>
      </div>
    </article>
  );
});

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h2a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
