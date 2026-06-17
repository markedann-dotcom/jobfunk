"use client";

import { useT } from "@/lib/i18n";
import { NettoCalculator } from "@/components/netto-calculator";

export default function NettoRechnerPage() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-7 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs font-semibold text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          JobFunke
        </span>
        <h1
          className="mt-4 text-3xl font-black text-ink sm:text-4xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {t("netto.page.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
          {t("netto.page.sub")}
        </p>
      </div>
      <NettoCalculator />
    </div>
  );
}
