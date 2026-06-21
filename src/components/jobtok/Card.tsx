"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { jobExternalLink, type JobListItem } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";

function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>(?=)/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\\\*/g, "")
    .replace(/\*{1,3}/g, "")
    .replace(/^[-•·]\s*/gm, "• ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Map angebotsart to accent color
function toneColor(art?: string): string {
  if (art === "4") return "#6366f1"; // Ausbildung - violet
  if (art === "34") return "#10b981"; // Minijob - green
  if (art === "2") return "#8b5cf6"; // Selbstständig - purple
  return "#f97316"; // default orange
}

function typeLabel(art?: string): string {
  if (art === "4") return "Ausbildung";
  if (art === "34") return "Minijob";
  if (art === "2") return "Selbstständig";
  return "Job";
}

export function JobCard({
  job,
  active,
  index,
}: {
  job: JobListItem;
  active: boolean;
  index: number;
}) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(job.refnr);
  const [desc, setDesc] = useState<string | null>(null);
  const tried = useRef(false);
  const accent = toneColor(job.angebotsart);
  const label = typeLabel(job.angebotsart);

  const location =
    [job.plz, job.ort].filter(Boolean).join(" ") || job.region || "—";
  const applyUrl = jobExternalLink(job);

  // Lazily load description when card becomes active
  useEffect(() => {
    if (!active || tried.current) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/job/${encodeURIComponent(job.refnr)}`);
        if (!res.ok) return;
        const d = await res.json();
        const raw = d.beschreibung || d.description || "";
        if (alive && raw) {
          setDesc(stripHtml(raw).slice(0, 380));
          tried.current = true;
        }
      } catch { /* allow later retry */ }
    })();
    return () => { alive = false; };
  }, [active, job.refnr]);

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ color: "var(--color-ink)" }}
    >
      {/* Background: soft gradient using accent color */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 10%, var(--color-page)) 0%, var(--color-page) 45%)`,
        }}
        aria-hidden
      />

      {/* Accent glow blob top-right */}
      <div
        className="pointer-events-none absolute right-[-30px] top-[-30px] h-48 w-48 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
        aria-hidden
      />

      {/* Content area */}
      <div className="relative z-10 flex flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-[calc(env(safe-area-inset-top)+4.5rem)]">

        {/* Type pill + new badge */}
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase"
            style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }}
          >
            {label}
          </span>
          {job.beruf && (
            <span
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                borderColor: "color-mix(in srgb, var(--color-ink) 12%, transparent)",
                color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
              }}
            >
              {job.beruf}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="mt-3 text-[1.65rem] font-extrabold leading-[1.15] tracking-tight"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {job.titel}
        </h2>

        {/* Company */}
        {job.arbeitgeber && (
          <div className="mt-2.5 flex items-center gap-2">
            <div
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-black text-white"
              style={{ background: accent }}
            >
              {job.arbeitgeber.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "color-mix(in srgb, var(--color-ink) 80%, transparent)" }}>
              {job.arbeitgeber}
            </p>
          </div>
        )}

        {/* Location */}
        <p
          className="mt-1.5 flex items-center gap-1.5 text-sm"
          style={{ color: "color-mix(in srgb, var(--color-ink) 52%, transparent)" }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
            <circle cx="12" cy="10.5" r="2.2" />
          </svg>
          {location}
        </p>

        {/* Divider */}
        <div
          className="mt-5 h-px w-full"
          style={{ background: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }}
        />

        {/* Description */}
        <div className="mt-4 flex-1 overflow-hidden">
          {desc ? (
            <p
              className="line-clamp-6 whitespace-pre-line text-[14.5px] leading-[1.65]"
              style={{ color: "color-mix(in srgb, var(--color-ink) 72%, transparent)" }}
            >
              {desc}…
            </p>
          ) : active ? (
            <div className="flex flex-col gap-2.5">
              {[100, 88, 76].map((w) => (
                <div
                  key={w}
                  className="animate-pulse rounded-full h-3"
                  style={{
                    width: `${w}%`,
                    background: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Action bar */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        style={{
          background: `linear-gradient(to top, color-mix(in srgb, var(--color-page) 96%, transparent) 0%, color-mix(in srgb, var(--color-page) 70%, transparent) 60%, transparent 100%)`,
          paddingTop: "2.5rem",
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Primary CTA */}
          <Link
            href={`/job/${job.refnr}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-xl transition active:scale-[0.98]"
            style={{
              background: accent,
              boxShadow: `0 8px 24px -8px ${accent}60`,
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            Mehr erfahren
          </Link>

          {/* Favorite */}
          <button
            onClick={() => toggle(job)}
            aria-pressed={fav}
            aria-label={fav ? "Gespeichert" : "Speichern"}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition active:scale-95"
            style={fav ? {
              background: `color-mix(in srgb, ${accent} 18%, transparent)`,
              borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
              color: accent,
            } : {
              background: "color-mix(in srgb, var(--color-ink) 7%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
              color: "var(--color-ink)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* External apply */}
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Jetzt bewerben"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition active:scale-95"
            style={{
              background: "color-mix(in srgb, var(--color-ink) 7%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
              color: "var(--color-ink)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
