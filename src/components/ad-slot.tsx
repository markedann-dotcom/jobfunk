"use client";

import { useT } from "@/lib/i18n";

type Props = {
  /** layout variant */
  variant?: "banner" | "inline";
  className?: string;
};

/**
 * Reusable advertising placeholder. Uses the abstract /ad-bg.png artwork
 * (matches hero palette) and is clearly labelled as "Anzeige / Реклама"
 * per German advertising-disclosure rules (§ 6 TMG / Trennungsgebot).
 * Swap the inner content for a real ad network embed later.
 */
export function AdSlot({ variant = "banner", className = "" }: Props) {
  const { t } = useT();
  const tall = variant === "banner";

  return (
    <aside
      aria-label={t("ad.label")}
      className={`relative w-full overflow-hidden rounded-3xl border border-border bg-surface ${className}`}
    >
      {/* abstract artwork */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70 dark:opacity-40"
        style={{ backgroundImage: "url(/ad-bg.png)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, var(--color-surface) 8%, rgba(255,255,255,0) 70%)",
        }}
        aria-hidden
      />

      {/* disclosure label */}
      <span className="absolute right-3 top-3 z-10 rounded-full border border-border bg-page/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted backdrop-blur">
        {t("ad.label")}
      </span>

      <div
        className={`relative z-[1] flex flex-col justify-center gap-1.5 px-6 ${
          tall ? "min-h-[150px] py-7 sm:min-h-[170px]" : "min-h-[112px] py-6"
        }`}
      >
        <p
          className="max-w-md text-lg font-extrabold leading-tight text-ink sm:text-xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {t("ad.placeholder.title")}
        </p>
        <p className="max-w-md text-sm text-muted">{t("ad.placeholder.sub")}</p>
        <a
          href="/impressum"
          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white transition hover:bg-accent-strong"
        >
          {t("ad.placeholder.cta")}
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
