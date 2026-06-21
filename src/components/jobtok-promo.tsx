"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export function JobTokPromo() {
  const { lang } = useT();

  const isUk = lang === "uk";

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border px-0 shadow-[0_20px_60px_-20px_rgba(120,72,20,0.18)]">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/jobtok-promo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      {/* Overlay — light left fade so text reads cleanly, dark mode gets more opacity */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(105deg, color-mix(in srgb, var(--color-page) 88%, transparent) 0%, color-mix(in srgb, var(--color-page) 55%, transparent) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 lg:max-w-[58%]">
        {/* NEW badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
          style={{
            background: "color-mix(in srgb, #f97316 14%, transparent)",
            borderColor: "color-mix(in srgb, #f97316 35%, transparent)",
            color: "#f97316",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          {isUk ? "НОВА ФУНКЦІЯ" : "NEUE FUNKTION"}
        </div>

        {/* Heading */}
        <h2
          className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {isUk ? (
            <>Job<span style={{ color: "#f97316" }}>Tok</span> — скролиш вакансії<br />поки їдеш у транспорті</>
          ) : (
            <>Job<span style={{ color: "#f97316" }}>Tok</span> — Jobs scrollen<br />während du unterwegs bist</>
          )}
        </h2>

        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
          {isUk
            ? "Гортай вакансії як у TikTok — одна за одною, без зайвих кліків. Ідеально для телефону в поїзді, автобусі або метро."
            : "Wische durch Jobs wie bei TikTok — eine nach der anderen, kein Klicken nötig. Perfekt fürs Handy im Zug, Bus oder in der U-Bahn."}
        </p>

        {/* Feature bullets */}
        <ul className="mt-5 space-y-2.5">
          {(isUk
            ? ["Обери свою землю (Bundesland)", "Свайп — і наступна вакансія", "Зберігай вподобані одним дотиком", "Доступно в мобільній версії сайту"]
            : ["Wähle dein Bundesland", "Wischen — nächster Job", "Speichere Favoriten mit einem Tap", "Verfügbar in der mobilen Webversion"]
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-ink">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                style={{ background: "#f97316" }}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/jobtok"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
              boxShadow: "0 8px 24px -8px rgba(249,115,22,0.55)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            {isUk ? "Спробувати JobTok" : "JobTok ausprobieren"}
          </Link>
          <span className="text-xs text-muted">
            {isUk ? "Мобільний сайт · Без застосунку" : "Mobile Website · Keine App nötig"}
          </span>
        </div>
      </div>
    </section>
  );
}
