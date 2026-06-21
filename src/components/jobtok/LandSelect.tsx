"use client";

import Link from "next/link";

export const BUNDESLAENDER = [
  { code: "all",                    de: "Ganz Deutschland",          uk: "Вся Німеччина",                  short: "DE" },
  { code: "Baden-Württemberg",      de: "Baden-Württemberg",         uk: "Баден-Вюртемберг",               short: "BW" },
  { code: "Bayern",                 de: "Bayern",                    uk: "Баварія",                        short: "BY" },
  { code: "Berlin",                 de: "Berlin",                    uk: "Берлін",                         short: "BE" },
  { code: "Brandenburg",            de: "Brandenburg",               uk: "Бранденбург",                    short: "BB" },
  { code: "Bremen",                 de: "Bremen",                    uk: "Бремен",                         short: "HB" },
  { code: "Hamburg",                de: "Hamburg",                   uk: "Гамбург",                        short: "HH" },
  { code: "Hessen",                 de: "Hessen",                    uk: "Гессен",                         short: "HE" },
  { code: "Mecklenburg-Vorpommern", de: "Mecklenburg-Vorpommern",    uk: "Мекленбург-Передня Померанія",   short: "MV" },
  { code: "Niedersachsen",          de: "Niedersachsen",             uk: "Нижня Саксонія",                 short: "NI" },
  { code: "Nordrhein-Westfalen",    de: "Nordrhein-Westfalen",       uk: "Пн. Рейн-Вестфалія",             short: "NW" },
  { code: "Rheinland-Pfalz",        de: "Rheinland-Pfalz",           uk: "Рейнланд-Пфальц",                short: "RP" },
  { code: "Saarland",               de: "Saarland",                  uk: "Саарланд",                       short: "SL" },
  { code: "Sachsen",                de: "Sachsen",                   uk: "Саксонія",                       short: "SN" },
  { code: "Sachsen-Anhalt",         de: "Sachsen-Anhalt",            uk: "Саксонія-Ангальт",               short: "ST" },
  { code: "Schleswig-Holstein",     de: "Schleswig-Holstein",        uk: "Шлезвіг-Гольштейн",              short: "SH" },
  { code: "Thüringen",              de: "Thüringen",                 uk: "Тюрингія",                       short: "TH" },
];

interface Props {
  lang: "de" | "uk";
  onSelect: (land: string) => void;
}

export function LandSelect({ lang, onSelect }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{ background: "var(--color-page)" }}
    >
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/jobtok-feed-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
        aria-hidden
      />

      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--color-page) 85%, transparent)" }}
      >
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-full transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--color-ink) 9%, transparent)",
            color: "var(--color-ink)",
          }}
          aria-label="Zurück"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-xl text-white"
            style={{ background: "var(--color-accent)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
            </svg>
          </div>
          <span
            className="text-[17px] font-black tracking-tight"
            style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}
          >
            Job<span style={{ color: "var(--color-accent)" }}>Tok</span>
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* Content wrapper — constrained on desktop */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-12 pt-6">
        {/* Headline */}
        <div className="mb-7 text-center">
          <h1
            className="text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-tight"
            style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}
          >
            {lang === "de" ? "Wo suchst du?" : "Де шукаєш?"}
          </h1>
          <p
            className="mt-2 text-[15px]"
            style={{ color: "color-mix(in srgb, var(--color-ink) 52%, transparent)" }}
          >
            {lang === "de"
              ? "Wähle ein Bundesland — wir zeigen dir passende Jobs"
              : "Обери землю — ми покажемо підходящі вакансії"}
          </p>
        </div>

        {/* "Ganz Deutschland" — full width on top */}
        <button
          onClick={() => onSelect("all")}
          className="mb-3 flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] hover:shadow-md"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))",
            borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)",
            color: "var(--color-ink)",
          }}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
            style={{ background: "var(--color-accent)" }}
          >
            DE
          </span>
          <span>
            <span className="block text-[15px] font-bold">
              {lang === "de" ? "Ganz Deutschland" : "Вся Німеччина"}
            </span>
            <span
              className="text-[12px]"
              style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}
            >
              {lang === "de" ? "Alle Bundesländer zusammen" : "Всі землі разом"}
            </span>
          </span>
          <svg viewBox="0 0 24 24" className="ml-auto h-5 w-5 shrink-0 opacity-30" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Divider label */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "color-mix(in srgb, var(--color-ink) 35%, transparent)" }}
          >
            {lang === "de" ? "Oder wähle ein Bundesland" : "або обери землю"}
          </span>
          <div className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }} />
        </div>

        {/* Grid of states */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {BUNDESLAENDER.filter((l) => l.code !== "all").map((land) => (
            <button
              key={land.code}
              onClick={() => onSelect(land.code)}
              className="group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-sm"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-ink)",
              }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-black"
                style={{
                  background: "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))",
                  color: "var(--color-accent)",
                }}
              >
                {land.short}
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight">
                {lang === "de" ? land.de : land.uk}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
