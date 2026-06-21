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

// Map angebotsart to accent color + gradient pair
function tone(art?: string): { accent: string; soft: string; label: string } {
  if (art === "4") return { accent: "#6366f1", soft: "rgba(99,102,241,0.09)", label: "Ausbildung" };
  if (art === "34") return { accent: "#10b981", soft: "rgba(16,185,129,0.09)", label: "Minijob" };
  if (art === "2") return { accent: "#8b5cf6", soft: "rgba(139,92,246,0.09)", label: "Selbstständig" };
  return { accent: "#f97316", soft: "rgba(249,115,22,0.09)", label: "Job" };
}

// Shorten long company names
function shortCompany(s: string): string {
  return s.length > 38 ? s.slice(0, 36) + "…" : s;
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
  const [expanded, setExpanded] = useState(false);
  const tried = useRef(false);
  const t = tone(job.angebotsart);

  const ort = job.ort || job.region || "";
  const plz = job.plz || "";
  const location = [plz, ort].filter(Boolean).join(" ") || "Deutschland";
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
          setDesc(stripHtml(raw));
          tried.current = true;
        }
      } catch { /* retry later */ }
    })();
    return () => { alive = false; };
  }, [active, job.refnr]);

  const displayDesc = desc
    ? (expanded ? desc : desc.slice(0, 420))
    : null;
  const canExpand = desc && desc.length > 420;

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{ background: "var(--color-page)", color: "var(--color-ink)", overflow: "hidden" }}
    >
      {/* Soft top gradient blob */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${t.accent} 14%, transparent) 0%, transparent 100%)`,
        }}
        aria-hidden
      />
      {/* Accent glow blob */}
      <div
        className="pointer-events-none absolute right-[-40px] top-[-40px] h-56 w-56 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${t.accent} 20%, transparent)` }}
        aria-hidden
      />

      {/* ---- CONTENT SCROLL AREA ---- */}
      <div
        className="jobtok-card-inner relative z-10 flex flex-1 flex-col px-5 sm:px-8 lg:px-10"
        style={{
          overflow: expanded ? "auto" : "hidden",
          paddingTop: "calc(env(safe-area-inset-top) + 4.25rem)",
          // Увеличили нижний отступ с 5.75rem до 9rem, чтобы контент гарантированно 
          // не перекрывался снизу PWA-баннером при скролле.
          paddingBottom: "calc(env(safe-area-inset-bottom) + 9rem)",
        }}
      >
        {/* Type pill + Beruf */}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
            style={{ background: t.soft, color: t.accent }}
          >
            {t.label}
          </span>
          {job.beruf && (
            <span
              className="min-w-0 max-w-[calc(100%-100px)] truncate rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                borderColor: "color-mix(in srgb, var(--color-ink) 14%, transparent)",
                color: "color-mix(in srgb, var(--color-ink) 58%, transparent)",
              }}
            >
              {job.beruf}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="mt-3 text-[clamp(1.4rem,3vw,2.1rem)] font-extrabold leading-[1.18] tracking-tight"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {job.titel}
        </h2>

        {/* Company row */}
        {job.arbeitgeber && (
          <div className="mt-3 flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 shrink-0 select-none place-items-center rounded-xl text-[12px] font-black text-white"
              style={{ background: t.accent }}
            >
              {job.arbeitgeber.slice(0, 2).toUpperCase()}
            </div>
            <p
              className="text-[15px] font-semibold"
              style={{ color: "color-mix(in srgb, var(--color-ink) 78%, transparent)" }}
            >
              {shortCompany(job.arbeitgeber)}
            </p>
          </div>
        )}

        {/* Meta row: location + angebotsart details */}
        <div
          className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]"
          style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}
        >
          {/* Location */}
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
              <circle cx="12" cy="10.5" r="2.2" />
            </svg>
            {location}
          </span>
          {/* Angebotsart detail */}
          {job.angebotsart === "34" && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Minijob / Aushilfe
            </span>
          )}
          {job.angebotsart === "4" && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 3l7 9H5l7-9z" /><path d="M5 12l7 9 7-9" />
              </svg>
              Ausbildung
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          className="mt-5 h-px w-full"
          style={{ background: "color-mix(in srgb, var(--color-ink) 7%, transparent)" }}
        />

        {/* Description */}
        <div className="mt-4 flex-1">
          {displayDesc ? (
            <>
              <p
                className="whitespace-pre-line text-[14.5px] leading-[1.7]"
                style={{ color: "color-mix(in srgb, var(--color-ink) 70%, transparent)" }}
              >
                {displayDesc}{!expanded && canExpand ? "…" : ""}
              </p>
              {canExpand && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                  className="mt-3 text-[13px] font-semibold transition-opacity hover:opacity-80"
                  style={{ color: t.accent }}
                >
                  {expanded ? "Weniger anzeigen ↑" : "Mehr anzeigen ↓"}
                </button>
              )}
            </>
          ) : active ? (
            // Skeleton lines
            <div className="flex flex-col gap-3 pt-1">
              {[100, 92, 84, 76, 90, 68].map((w, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-full"
                  style={{
                    height: "0.75rem",
                    width: `${w}%`,
                    background: "color-mix(in srgb, var(--color-ink) 7%, transparent)",
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          ) : (
            // Pre-load placeholder
            <div
              className="flex h-32 items-center justify-center rounded-2xl text-sm"
              style={{
                background: "color-mix(in srgb, var(--color-ink) 4%, transparent)",
                color: "color-mix(in srgb, var(--color-ink) 30%, transparent)",
              }}
            >
              Wische nach oben
            </div>
          )}
        </div>
      </div>

      {/* ---- ACTION BAR (fixed to card bottom) ---- */}
      <div
        className="absolute inset-x-0 bottom-0 z-20"
        style={{
          background: `linear-gradient(to top,
            color-mix(in srgb, var(--color-page) 98%, transparent) 0%,
            color-mix(in srgb, var(--color-page) 82%, transparent) 55%,
            transparent 100%)`,
          paddingTop: "3rem",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Primary: Mehr erfahren */}
          {/* ФИКС ТУТ: оборачиваем job.refnr в encodeURIComponent, чтобы слэши в ID не ломали роутер Next.js при переходе на деталь */}
          <Link
            href={`/job/${encodeURIComponent(job.refnr)}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white shadow-lg transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${t.accent}, color-mix(in srgb, ${t.accent} 80%, #000))`,
              boxShadow: `0 8px 24px -8px ${t.accent}55`,
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            Mehr erfahren
          </Link>

          {/* Favorite */}
          <button
            onClick={() => toggle(job)}
            aria-pressed={fav}
            aria-label={fav ? "Gespeichert" : "Speichern"}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-all duration-150 active:scale-95"
            style={
              fav
                ? {
                    background: `color-mix(in srgb, ${t.accent} 15%, transparent)`,
                    borderColor: `color-mix(in srgb, ${t.accent} 40%, transparent)`,
                    color: t.accent,
                  }
                : {
                    background: "color-mix(in srgb, var(--color-ink) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                    color: "var(--color-ink)",
                  }
            }
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
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-all duration-150 active:scale-95"
            style={{
              background: "color-mix(in srgb, var(--color-ink) 6%, transparent)",
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
