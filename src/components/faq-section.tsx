"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

const ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

export function FaqSection() {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(0);

  // JSON-LD FAQPage (uses German text for SEO consistency)
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ITEMS.map((q) => ({
      "@type": "Question",
      name: t(`faq.${q}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`faq.${q}.a`) },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-ink sm:text-3xl" style={{ fontFamily: "var(--font-fraunces)" }}>
          {t("faq.title")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("faq.sub")}</p>
      </div>
      <div className="space-y-3">
        {ITEMS.map((q, i) => {
          const isOpen = open === i;
          return (
            <div
              key={q}
              className="overflow-hidden rounded-2xl border border-border bg-surface/85 backdrop-blur-sm transition"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-bold text-ink">{t(`faq.${q}.q`)}</span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-accent transition ${
                    isOpen ? "rotate-45 bg-accent-soft" : ""
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{t(`faq.${q}.a`)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
