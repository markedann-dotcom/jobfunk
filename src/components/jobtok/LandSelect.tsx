"use client";

import Link from "next/link";

export const BUNDESLAENDER = [
  { code: "all", de: "Ganz Deutschland", uk: "Вся Німеччина", emoji: "🇩🇪" },
  { code: "Baden-Württemberg", de: "Baden-Württemberg", uk: "Баден-Вюртемберг", emoji: "🌲" },
  { code: "Bayern", de: "Bayern", uk: "Баварія", emoji: "⚪" },
  { code: "Berlin", de: "Berlin", uk: "Берлін", emoji: "🐻" },
  { code: "Brandenburg", de: "Brandenburg", uk: "Бранденбург", emoji: "🦅" },
  { code: "Bremen", de: "Bremen", uk: "Бремен", emoji: "🔑" },
  { code: "Hamburg", de: "Hamburg", uk: "Гамбург", emoji: "⚓" },
  { code: "Hessen", de: "Hessen", uk: "Гессен", emoji: "🦁" },
  { code: "Mecklenburg-Vorpommern", de: "Mecklenburg-Vorpommern", uk: "Мекленбург-Передня Померанія", emoji: "🌊" },
  { code: "Niedersachsen", de: "Niedersachsen", uk: "Нижня Саксонія", emoji: "🐴" },
  { code: "Nordrhein-Westfalen", de: "Nordrhein-Westfalen", uk: "Північний Рейн-Вестфалія", emoji: "🏭" },
  { code: "Rheinland-Pfalz", de: "Rheinland-Pfalz", uk: "Рейнланд-Пфальц", emoji: "🍷" },
  { code: "Saarland", de: "Saarland", uk: "Саарланд", emoji: "🔵" },
  { code: "Sachsen", de: "Sachsen", uk: "Саксонія", emoji: "🌉" },
  { code: "Sachsen-Anhalt", de: "Sachsen-Anhalt", uk: "Саксонія-Ангальт", emoji: "🌾" },
  { code: "Schleswig-Holstein", de: "Schleswig-Holstein", uk: "Шлезвіг-Гольштейн", emoji: "🌊" },
  { code: "Thüringen", de: "Thüringen", uk: "Тюрингія", emoji: "🌲" },
];

interface Props {
  lang: "de" | "uk";
  onSelect: (land: string) => void;
}

export function LandSelect({ lang, onSelect }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{
        background: "var(--color-page)",
        backgroundImage: "url('/jobtok-feed-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--color-page) 88%, transparent)" }}
      >
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-full transition active:scale-95"
          style={{ background: "color-mix(in srgb, var(--color-ink) 10%, transparent)", color: "var(--color-ink)" }}
          aria-label="Zurück"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
          </span>
          <span className="text-lg font-black tracking-tight" style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}>
            Job<span style={{ color: "var(--color-accent)" }}>Tok</span>
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Headline */}
      <div className="px-5 pb-6 pt-4 text-center">
        <h1
          className="text-2xl font-black leading-tight"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-fraunces)" }}
        >
          {lang === "de" ? "Wo suchst du?" : "Де шукаєш?"}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-muted)" }}>
          {lang === "de"
            ? "Wähle ein Bundesland — wir zeigen dir passende Jobs"
            : "Обери землю — ми покажемо підходящі вакансії"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-10 sm:grid-cols-3">
        {BUNDESLAENDER.map((land) => (
          <button
            key={land.code}
            onClick={() => onSelect(land.code)}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 text-center transition-all duration-200 active:scale-[0.97]"
            style={{
              background: land.code === "all"
                ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))"
                : "var(--color-surface)",
              borderColor: land.code === "all"
                ? "color-mix(in srgb, var(--color-accent) 40%, transparent)"
                : "var(--color-border)",
              color: "var(--color-ink)",
            }}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {land.code === "all" ? "🗺️" : "📍"}
            </span>
            <span className="text-[13px] font-bold leading-tight">
              {lang === "de" ? land.de : land.uk}
            </span>
            {land.code === "all" && (
              <span
                className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                ALL
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
