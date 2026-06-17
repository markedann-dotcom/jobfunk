"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useT, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "de", label: "DE", native: "Deutsch" },
  { code: "uk", label: "UA", native: "Українська" },
];

function Globe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIdx(0);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (!open) return;
      
      if (e.key === "ArrowDown") {
        setFocusedIdx((i) => (i + 1) % LANGS.length);
      } else if (e.key === "ArrowUp") {
        setFocusedIdx((i) => (i - 1 + LANGS.length) % LANGS.length);
      } else if (e.key === "Enter") {
        setLang(LANGS[focusedIdx].code);
        close();
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, focusedIdx, setLang, close]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sprache wählen"
        className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface pl-2.5 pr-2 text-muted transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <Globe className="h-[18px] w-[18px]" />
        <span className="text-[13px] font-bold uppercase tracking-wide text-ink">
          {current.label}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        role="listbox"
        aria-label="Sprachauswahl"
        className={`absolute right-0 top-full z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgba(20,17,15,0.35)] transition-all duration-150 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {LANGS.map((l, idx) => {
          const active = l.code === lang;
          const isFocused = idx === focusedIdx;
          return (
            <button
              key={l.code}
              role="option"
              aria-selected={active}
              onClick={() => {
                setLang(l.code);
                close();
              }}
              onMouseEnter={() => setFocusedIdx(idx)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                isFocused ? "bg-accent-soft" : ""
              } ${active ? "text-accent-strong" : "text-ink"}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${
                  active
                    ? "bg-accent text-white"
                    : "bg-page text-muted"
                }`}
              >
                {l.label}
              </span>
              <span className="flex-1 text-sm font-semibold">{l.native}</span>
              {active && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path
                    d="m5 12 5 5L20 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
