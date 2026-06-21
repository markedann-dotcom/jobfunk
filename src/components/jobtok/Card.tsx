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
    // strip markdown noise the Bundesagentur feed sometimes returns
    .replace(/^#{1,6}\s*/gm, "")           // ### headings
    .replace(/\\\*/g, "")                   // escaped \*\*
    .replace(/\*{1,3}/g, "")                // **bold** / *italic*
    .replace(/^[-•·]\s*/gm, "• ")           // normalise bullets
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function JobCard({ job, active }: { job: JobListItem; active: boolean }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(job.refnr);
  const [desc, setDesc] = useState<string | null>(null);
  const tried = useRef(false);

  const location =
    [job.plz, job.ort].filter(Boolean).join(" ") || job.region || "—";
  const applyUrl = jobExternalLink(job);

  // Lazily load the description only when this card becomes active.
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
          setDesc(stripHtml(raw).slice(0, 420));
          tried.current = true; // only lock in after a successful render
        }
      } catch {
        /* ignore — allow a later retry when active again */
      }
    })();
    return () => {
      alive = false;
    };
  }, [active, job.refnr]);

  return (
    <div
      className="relative flex h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-[calc(env(safe-area-inset-top)+4.5rem)]"
      style={{
        color: "var(--color-ink)",
        background:
          "linear-gradient(to bottom, color-mix(in srgb, var(--color-accent) 8%, var(--color-page)) 0%, var(--color-page) 38%, var(--color-page) 100%)",
      }}
    >
      {/* Content — NOT scrollable; the whole card is one snap slide */}
      <div className="flex-1 overflow-hidden" style={{ touchAction: "pan-y" }}>
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 18%, transparent)",
            color: "var(--color-accent-strong)",
          }}
        >
          {job.beruf ?? "Job"}
        </span>
        <h2 className="text-[26px] font-extrabold leading-tight">{job.titel}</h2>
        {job.arbeitgeber && (
          <p
            className="mt-1.5 flex items-center gap-1.5 text-base font-semibold"
            style={{ color: "color-mix(in srgb, var(--color-ink) 72%, transparent)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h2a2 2 0 0 1 2 2v10" strokeLinecap="round" />
            </svg>
            {job.arbeitgeber}
          </p>
        )}
        <p
          className="mt-1 flex items-center gap-1.5 text-sm"
          style={{ color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
            <circle cx="12" cy="10.5" r="2.2" />
          </svg>
          {location}
        </p>

        <div
          className="mt-5 text-[15px] leading-relaxed"
          style={{ color: "color-mix(in srgb, var(--color-ink) 78%, transparent)" }}
        >
          {desc ? (
            <p className="whitespace-pre-line">{desc}…</p>
          ) : (
            <p className="opacity-40">{active ? "Beschreibung wird geladen…" : ""}</p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="absolute inset-x-5 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] flex items-center gap-3">
        <Link
          href={`/job/${job.refnr}`}
          className="flex-1 rounded-2xl bg-orange-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition active:scale-[0.98]"
        >
          Mehr erfahren
        </Link>

        <button
          onClick={() => toggle(job)}
          aria-pressed={fav}
          aria-label={fav ? "Gespeichert" : "Speichern"}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition active:scale-95"
          style={
            fav
              ? {
                  background: "color-mix(in srgb, var(--color-accent) 25%, transparent)",
                  color: "var(--color-accent-strong)",
                }
              : {
                  background: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                  color: "var(--color-ink)",
                }
          }
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bewerben"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
