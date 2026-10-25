"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { relatedBerufe } from "@/lib/related-berufe";

export function RelatedBerufe({
  input,
  title,
  className = "",
}: {
  input?: string;
  title?: string;
  className?: string;
}) {
  const { t } = useT();
  const items = relatedBerufe(input);
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-muted">
        {title ?? t("rel.title")}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((r) => (
          <Link
            key={r}
            href={`/suche?was=${encodeURIComponent(r)}&umkreis=25&page=1`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
            {r}
          </Link>
        ))}
      </div>
    </div>
  );
}
