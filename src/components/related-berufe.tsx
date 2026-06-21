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
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        {title ?? t("rel.title")}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((r) => (
          <Link
            key={r}
            href={`/suche?was=${encodeURIComponent(r)}&umkreis=25&page=1`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white hover:shadow-[0_4px_12px_-3px_var(--accent)] active:translate-y-0"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-accent transition-colors duration-200 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
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
