"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { getRecent, clearRecent } from "@/lib/recent";
import type { RecentJob } from "@/lib/recent";
import { getSavedSearches, removeSearch, searchToQuery } from "@/lib/saved-search";
import type { SavedSearch } from "@/lib/saved-search";

export function HomeRecent() {
  const { t } = useT();
  const [recent, setRecent] = useState<RecentJob[]>([]);
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const sync = () => {
      setRecent(getRecent());
      setSaved(getSavedSearches());
    };
    sync();
    window.addEventListener("jf:recent", sync);
    window.addEventListener("jf:saved-search", sync);
    return () => {
      window.removeEventListener("jf:recent", sync);
      window.removeEventListener("jf:saved-search", sync);
    };
  }, []);

  if (recent.length === 0 && saved.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently viewed */}
        {recent.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface/85 p-5 shadow-[0_2px_10px_-4px_rgba(60,40,20,0.06)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                className="flex items-center gap-2 text-lg font-bold text-ink"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t("recent.title")}
              </h2>
              <button
                onClick={() => clearRecent()}
                className="text-xs font-semibold text-muted transition hover:text-accent"
              >
                {t("recent.clear")}
              </button>
            </div>
            <ul className="space-y-2 overflow-hidden">
              {recent.slice(0, 5).map((r) => (
                <li key={r.refnr} className="min-w-0">
                  <Link
                    href={`/job/${encodeURIComponent(r.refnr)}`}
                    className="group flex min-w-0 overflow-hidden items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition hover:border-border hover:bg-page/60"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-page text-sm font-black text-ink/70"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                      aria-hidden
                    >
                      {(r.arbeitgeber ?? r.titel ?? "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{r.titel}</span>
                      <span className="block truncate text-xs text-muted">
                        {[r.arbeitgeber, [r.plz, r.ort].filter(Boolean).join(" ")].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </span>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Saved searches */}
        {saved.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface/85 p-5 shadow-[0_2px_10px_-4px_rgba(60,40,20,0.06)] backdrop-blur-sm sm:p-6">
            <h2
              className="mb-4 flex items-center gap-2 text-lg font-bold text-ink"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {t("saved.title")}
            </h2>
            <ul className="space-y-2 overflow-hidden">
              {saved.slice(0, 5).map((s) => {
                const labelParts = [s.was, s.wo].filter(Boolean);
                const label = labelParts.length ? labelParts.join(" · ") : t("saved.run");
                return (
                  <li key={s.id} className="flex min-w-0 items-center gap-2">
                    <Link
                      href={`/suche?${searchToQuery(s)}`}
                      className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition hover:border-border hover:bg-page/60"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3-3" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="block min-w-0 flex-1 truncate text-sm font-bold text-ink">{label}</span>
                      <span className="hidden shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white transition group-hover:bg-accent-strong sm:inline">
                        {t("saved.run")}
                      </span>
                    </Link>
                    <button
                      onClick={() => removeSearch(s.id)}
                      aria-label={t("saved.delete")}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}