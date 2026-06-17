"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { SearchForm } from "@/components/search-form";
import { JobCard } from "@/components/job-card";
import { AdSlot } from "@/components/ad-slot";
import { JobsMap } from "@/components/jobs-map";
import { RelatedBerufe } from "@/components/related-berufe";
import type { SearchResult } from "@/lib/api";
import { isSearchSaved, saveSearch, removeSearchBySignature } from "@/lib/saved-search";
import { recordHistory } from "@/lib/search-history";

const PAGE_SIZE = 25;

export function SearchResults() {
  const { t } = useT();
  const router = useRouter();
  const sp = useSearchParams();

  const was = sp.get("was") ?? "";
  const wo = sp.get("wo") ?? "";
  const umkreis = sp.get("umkreis") ?? "25";
  const angebotsart = sp.get("angebotsart") ?? "";
  const arbeitszeit = sp.get("arbeitszeit") ?? "";
  const veroeffentlichtseit = sp.get("veroeffentlichtseit") ?? "";
  const befristung = sp.get("befristung") ?? "";
  const sort = sp.get("sort") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? "1"));

  const [data, setData] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const searchObj = useMemo(
    () => ({ was, wo, umkreis, angebotsart, arbeitszeit, veroeffentlichtseit, befristung, sort }),
    [was, wo, umkreis, angebotsart, arbeitszeit, veroeffentlichtseit, befristung, sort]
  );

  useEffect(() => {
    setSaved(isSearchSaved(searchObj));
    function onChange() {
      setSaved(isSearchSaved(searchObj));
    }
    window.addEventListener("jf:saved-search", onChange);
    return () => window.removeEventListener("jf:saved-search", onChange);
  }, [searchObj]);

  function toggleSave() {
    if (saved) removeSearchBySignature(searchObj);
    else saveSearch(searchObj);
    setSaved((s) => !s);
  }

  function setSort(v: string) {
    const q = new URLSearchParams(sp.toString());
    if (v) q.set("sort", v);
    else q.delete("sort");
    q.set("page", "1");
    router.push(`/suche?${q.toString()}`);
  }

  const queryString = useMemo(() => {
    const q = new URLSearchParams();
    if (was) q.set("was", was);
    if (wo) q.set("wo", wo);
    q.set("umkreis", umkreis);
    if (angebotsart) q.set("angebotsart", angebotsart);
    if (arbeitszeit) q.set("arbeitszeit", arbeitszeit);
    if (veroeffentlichtseit) q.set("veroeffentlichtseit", veroeffentlichtseit);
    if (befristung) q.set("befristung", befristung);
    if (sort) q.set("sort", sort);
    q.set("page", String(page));
    q.set("size", String(PAGE_SIZE));
    return q.toString();
  }, [was, wo, umkreis, angebotsart, arbeitszeit, veroeffentlichtseit, befristung, sort, page]);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setData(null);
    fetch(`/api/search?${queryString}`)
      .then((r) => {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then((d: SearchResult) => {
        if (!alive) return;
        setData(d);
        setStatus("ok");
        recordHistory({ was, wo, umkreis, angebotsart });
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [queryString]);

  const total = data?.total ?? 0;
  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE) || 1, 100);

  function goPage(p: number) {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(p));
    router.push(`/suche?${q.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="jobs-bg" aria-hidden />
      {/* search panel */}
      <div className="mb-7">
        <SearchForm
          variant="compact"
          initial={{ was, wo, umkreis, angebotsart, arbeitszeit, veroeffentlichtseit, befristung, sort }}
        />
      </div>

      {/* header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-black text-ink sm:text-3xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("results.title")}
          </h1>
          {status === "ok" && total > 0 && (
            <p className="mt-1 text-sm text-muted">
              <span className="font-bold text-ink">{total.toLocaleString("de-DE")}</span>{" "}
              {t("results.count")}
              {was && (
                <>
                  {" "}· <span className="text-accent">{was}</span>
                </>
              )}
              {wo && <> · {wo}</>}
            </p>
          )}
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-muted transition hover:text-accent"
        >
          ← {t("results.back")}
        </Link>
      </div>

      {/* toolbar: view toggle + sort + save search */}
      {status === "ok" && data && data.jobs.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => setView("list")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition ${
                view === "list" ? "bg-accent text-white" : "text-muted hover:text-accent"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
              </svg>
              {t("map.list")}
            </button>
            <button
              onClick={() => setView("map")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition ${
                view === "map" ? "bg-accent text-white" : "text-muted hover:text-accent"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" strokeLinejoin="round" />
                <path d="M9 4v14M15 6v14" strokeLinecap="round" />
              </svg>
              {t("map.map")}
            </button>
          </div>

          <label className="inline-flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">{t("sort.label")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="">{t("sort.relevance")}</option>
              <option value="aktualitaet">{t("sort.date")}</option>
              {wo && <option value="entfernung">{t("sort.distance")}</option>}
            </select>
          </label>

          <button
            onClick={toggleSave}
            className={`ml-auto inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              saved
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border bg-surface text-ink hover:border-accent hover:text-accent"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4V5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {saved ? t("saved.saved") : t("saved.save")}
          </button>
        </div>
      )}

      {/* third-party data disclaimer */}
      {status === "ok" && data && data.jobs.length > 0 && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-border bg-page/60 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("disc.jobs")}
        </p>
      )}

      {/* states */}
      {status === "loading" && <LoadingState label={t("results.loading")} />}

      {status === "error" && (
        <EmptyState
          tone="error"
          title={t("results.error.title")}
          sub={t("results.error.sub")}
          action={
            <button
              onClick={() => goPage(page)}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              {t("form.submit")}
            </button>
          }
        />
      )}

      {status === "ok" && data && data.jobs.length === 0 && (
        <>
          <EmptyState title={t("results.empty.title")} sub={t("results.empty.sub")} />
          <div className="mx-auto mt-6 max-w-md">
            <RelatedBerufe input={was} />
          </div>
        </>
      )}

      {status === "ok" && data && data.jobs.length > 0 && (
        <>
          {view === "map" && (
            <div className="mb-6">
              <JobsMap jobs={data.jobs} />
            </div>
          )}

          <div id="results" className="grid gap-4 md:grid-cols-2">
            {data.jobs.map((job, i) => (
              <JobCard key={job.refnr + i} job={job} idx={i} />
            ))}
          </div>

          <div className="mt-6">
            <AdSlot variant="inline" />
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onGo={goPage}
              prev={t("page.prev")}
              next={t("page.next")}
              ofLabel={t("page.of")}
            />
          )}
        </>
      )}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        {label}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  sub,
  action,
  tone = "empty",
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
  tone?: "empty" | "error";
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div
        className={`grid h-16 w-16 place-items-center rounded-2xl ${
          tone === "error" ? "bg-red-50 text-red-500" : "bg-accent-soft text-accent-strong"
        }`}
      >
        {tone === "error" ? (
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3M8 11h6" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h2
        className="mt-5 text-xl font-bold text-ink"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">{sub}</p>
      {action}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onGo,
  prev,
  next,
  ofLabel,
}: {
  page: number;
  totalPages: number;
  onGo: (p: number) => void;
  prev: string;
  next: string;
  ofLabel: string;
}) {
  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) nums.push(i);

  const btn =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-bold transition disabled:opacity-40";

  return (
    <div className="mt-9 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button onClick={() => onGo(page - 1)} disabled={page <= 1} className={`${btn} hover:border-accent hover:text-accent`}>
          ← {prev}
        </button>
        {nums.map((n) => (
          <button
            key={n}
            onClick={() => onGo(n)}
            className={`${btn} ${
              n === page
                ? "border-accent bg-accent text-white"
                : "text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {n}
          </button>
        ))}
        <button onClick={() => onGo(page + 1)} disabled={page >= totalPages} className={`${btn} hover:border-accent hover:text-accent`}>
          {next} →
        </button>
      </div>
      <p className="text-xs text-muted">
        {page} {ofLabel} {totalPages}
      </p>
    </div>
  );
}
