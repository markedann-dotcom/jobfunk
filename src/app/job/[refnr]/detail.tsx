"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useT } from "@/lib/i18n";
import type { JobDetail } from "@/lib/api";
import { jobExternalLink } from "@/lib/api";
import { formatDate, typeMeta, toneVar } from "@/lib/display";
import { useFavorites } from "@/lib/favorites";
import { recordRecent } from "@/lib/recent";
import { ShareMenu } from "@/components/share-menu";
import { JobDescription } from "@/components/job-description";
import { JobCard } from "@/components/job-card";
import { NettoCalculator } from "@/components/netto-calculator";
import { BewerbungTips } from "@/components/bewerbung-tips";
import { RelatedBerufe } from "@/components/related-berufe";
import type { JobListItem, SearchResult } from "@/lib/api";

export function JobDetailView({ refnr }: { refnr: string }) {
  const { t, lang } = useT();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetch(`/api/job/${encodeURIComponent(refnr)}`)
      .then((r) => {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then((d: JobDetail) => {
        if (!alive) return;
        setJob(d);
        setStatus("ok");
        recordRecent({
          refnr: d.refnr,
          titel: d.titel,
          arbeitgeber: d.arbeitgeber,
          ort: d.ort,
          plz: d.plz,
          angebotsart: d.branche === "Minijob" ? "34" : undefined,
        });
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [refnr]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="jobs-bg" aria-hidden />
      <button
        onClick={() => history.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← {t("detail.back")}
      </button>

      {status === "loading" && (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
        </div>
      )}

      {status === "error" && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-muted">{t("detail.error")}</p>
          <Link
            href="/suche"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            {t("results.back")}
          </Link>
        </div>
      )}

      {status === "ok" && job && <DetailBody job={job} lang={lang} t={t} />}
    </div>
  );
}

function DetailBody({
  job,
  lang,
  t,
}: {
  job: JobDetail;
  lang: "de" | "uk";
  t: (k: string) => string;
}) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(job.refnr);
  const tm = typeMeta(job.branche === "Minijob" ? "34" : undefined);
  const cvar = toneVar[tm.tone] ?? "amber";
  const toneStyle = {
    "--cc": `var(--c-${cvar})`,
    "--cc-soft": `var(--c-${cvar}-soft)`,
  } as CSSProperties;
  const location =
    [job.strasse, [job.plz, job.ort].filter(Boolean).join(" "), job.region]
      .filter(Boolean)
      .join(", ") || "—";
  const external = jobExternalLink(job);

  const isArbeitnow = job.refnr.startsWith("arbeitnow-");
  const [letter, setLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/job/motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: job.titel,
          arbeitgeber: job.arbeitgeber,
          ort: job.ort,
          refnr: job.refnr,
          isMinijob: job.branche === "Minijob",
        }),
      });
      const data = await res.json();
      setLetter(data.text);
    } catch (err) {
      console.error("Failed to generate", err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadLetterAsPdf = async () => {
    if (!letter) return;
    setDownloading(true);
    try {
      // jsPDF is loaded lazily so the main bundle doesn't carry the extra weight
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 20;
      const marginBottom = 20;
      const usableWidth = pageWidth - marginLeft - marginRight;
      const lineHeight = 6; // mm, matches 11pt body text below

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      // Split into paragraphs first so blank lines are preserved, then
      // word-wrap each paragraph to the usable page width.
      const paragraphs = letter.split(/\n/);
      let cursorY = marginTop;

      for (const paragraph of paragraphs) {
        const lines = paragraph.length
          ? doc.splitTextToSize(paragraph, usableWidth)
          : [""];

        for (const line of lines) {
          if (cursorY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            cursorY = marginTop;
          }
          doc.text(line, marginLeft, cursorY);
          cursorY += lineHeight;
        }
      }

      const safeCompany = (job.arbeitgeber || "Unternehmen").replace(
        /[^\p{L}\p{N}_-]+/gu,
        "_"
      );
      doc.save(`Motivationsschreiben_${safeCompany}.pdf`);
    } catch (err) {
      console.error("Failed to create PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="fade-up">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_14px_-6px_rgba(60,40,20,0.12)] sm:p-8" style={toneStyle}>
        <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--cc)" }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {job.branche === "Minijob" && (
                <span className="mb-3 inline-block rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "var(--cc-soft)", color: "var(--cc)" }}>
                  {t("type.34")}
                </span>
              )}
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${isArbeitnow ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                {isArbeitnow ? "Arbeitnow" : "Bundesagentur für Arbeit"}
              </span>
            </div>
            <h1
              className="text-2xl font-black leading-tight text-ink sm:text-3xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {job.titel}
            </h1>
            {job.arbeitgeber && (
              <p className="mt-2 text-lg font-semibold text-ink/80">{job.arbeitgeber}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => toggle({ ...job, savedAt: Date.now() })}
              aria-label={fav ? t("fav.added") : t("fav.add")}
              aria-pressed={fav}
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                fav
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ShareMenu refnr={job.refnr} title={job.titel} company={job.arbeitgeber} />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field icon={<PinIcon />} label={t("detail.location")} value={location} />
          <Field
            icon={<ClockIcon />}
            label={t("detail.published")}
            value={formatDate(job.published, lang)}
          />
          {job.eintrittsdatum && (
            <Field
              icon={<CalIcon />}
              label={t("detail.start")}
              value={formatDate(job.eintrittsdatum, lang)}
            />
          )}
          {job.arbeitszeit && (
            <Field icon={<TimeIcon />} label={t("detail.worktime")} value={job.arbeitszeit} />
          )}
          {job.verguetung && (
            <Field icon={<EuroIcon />} label={t("detail.salary")} value={job.verguetung} />
          )}
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={external}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-white transition hover:bg-accent-strong active:scale-[0.98]"
          >
            {t("detail.apply")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {!isArbeitnow && (
            <a
              href={`https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(job.refnr)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-border px-7 text-[15px] font-bold text-ink transition hover:border-accent hover:text-accent"
            >
              {t("detail.goto")}
            </a>
          )}
        </div>
      </header>

      <section className="mt-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2
          className="flex items-center gap-2.5 text-xl font-bold text-ink"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-strong">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
            </svg>
          </span>
          {t("detail.description")}
        </h2>
        {job.beschreibung ? (
          <JobDescription text={job.beschreibung} />
        ) : (
          <p className="mt-4 text-muted">{t("detail.nodesc")}</p>
        )}

        <div className="mt-6 pt-6 border-t border-border/60 flex justify-center">
          <button
            onClick={generateLetter}
            disabled={generating}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent-soft px-5 text-sm font-bold text-accent-strong transition hover:bg-accent hover:text-white disabled:opacity-50"
          >
            {generating ? "Wird generiert..." : "Motivationsschreiben erstellen"}
          </button>
        </div>
      </section>

      {letter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <h3 className="font-bold text-lg mb-3">Vorschau</h3>
            <div className="flex-1 overflow-y-auto bg-page p-4 rounded-xl font-mono text-xs whitespace-pre-wrap">{letter}</div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setLetter(null)} className="px-4 py-2 border rounded-lg">Schließen</button>
              <button
                onClick={downloadLetterAsPdf}
                disabled={downloading}
                className="px-4 py-2 bg-accent text-white font-bold rounded-lg disabled:opacity-50"
              >
                {downloading ? "Wird erstellt..." : "Als PDF herunterladen"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-page/60 px-4 py-3 text-xs leading-relaxed text-muted">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("disc.jobs")}
      </p>

      <RelatedBerufe input={job.beruf || job.titel} className="mt-6" />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <BewerbungTips beruf={job.beruf} />
        <NettoCalculator compact />
      </div>

      <SimilarJobs job={job} t={t} />
    </article>
  );
}

function SimilarJobs({ job, t }: { job: JobDetail; t: (k: string) => string }) {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const query = (job.beruf || job.titel || "").trim();

  useEffect(() => {
    if (!query) return;
    let alive = true;
    const q = new URLSearchParams();
    q.set("was", query);
    q.set("size", "6");
    fetch(`/api/search?${q.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: SearchResult) => {
        if (!alive) return;
        setJobs((d.jobs || []).filter((j) => j.refnr !== job.refnr).slice(0, 4));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [query, job.refnr]);

  if (jobs.length === 0) return null;

  return (
    <section className="mt-8">
      <h2
        className="mb-4 flex items-center gap-2.5 text-xl font-bold text-ink"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-strong">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
          </svg>
        </span>
        {t("similar.title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((j, i) => (
          <JobCard key={j.refnr + i} job={j} idx={i} />
        ))}
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-strong">
        {icon}
      </span>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
function TimeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function EuroIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 7a5 5 0 1 0 0 10M5 10h7M5 14h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
