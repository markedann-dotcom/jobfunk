"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { JobCard } from "@/components/job-card";

export default function MerklistePage() {
  const { t } = useT();
  const { favorites, count } = useFavorites();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" />
          </svg>
        </span>
        <div>
          <h1
            className="text-2xl font-black tracking-tight text-ink sm:text-3xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("fav.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {count > 0 ? (
              <>
                <span className="font-bold text-ink">{count}</span> {t("fav.count")}
              </>
            ) : (
              t("fav.sub")
            )}
          </p>
        </div>
      </div>

      {count === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            className="mt-5 text-xl font-bold text-ink"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("fav.empty.title")}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">{t("fav.empty.sub")}</p>
          <Link
            href="/suche"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            {t("fav.empty.cta")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((job, i) => (
            <JobCard key={job.refnr} job={job} idx={i} />
          ))}
        </div>
      )}
    </div>
  );
}
