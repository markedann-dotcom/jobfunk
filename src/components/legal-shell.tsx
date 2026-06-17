"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export function LegalShell({
  titleKey,
  children,
}: {
  titleKey: string;
  children: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← {t("nav.home")}
      </Link>
      <h1
        className="text-3xl font-black tracking-tight text-ink sm:text-4xl"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {t(titleKey)}
      </h1>
      <div className="legal-content mt-8">{children}</div>
      <p className="mt-12 text-xs text-muted">
        Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
