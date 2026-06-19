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
  const [showEditor, setShowEditor] = useState(false);

  // Данные отправителя
  const [senderName, setSenderName] = useState("");
  const [senderStreet, setSenderStreet] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

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
          senderName,
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
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const W = 210;
      const H = 297;
      const mL = 25; // left margin (DIN 5008)
      const mR = 20;
      const usable = W - mL - mR;

      // ── Акцентная полоса сверху ──────────────────────────────
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, W, 6, "F");

      // ── Имя отправителя мелко в шапке ────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      const senderLine = [senderName, senderStreet, senderCity]
        .filter(Boolean)
        .join(" · ");
      doc.text(senderLine || "Ihr Name · Straße · Stadt", mL, 14);

      // тонкая разделительная линия под шапкой
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(mL, 16, W - mR, 16);

      // ── Адрес получателя (окошко DIN 5008) ───────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(job.arbeitgeber || "Unternehmen", mL, 35);
      doc.text(job.strasse || "Straße des Unternehmens", mL, 40);
      const cityLine = [job.plz, job.ort].filter(Boolean).join(" ");
      doc.text(cityLine || "PLZ Ort", mL, 45);

      // ── Контакт отправителя справа ────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(senderName || "Ihr Name", W - mR, 32, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      if (senderStreet) doc.text(senderStreet, W - mR, 37, { align: "right" });
      if (senderCity) doc.text(senderCity, W - mR, 42, { align: "right" });
      if (senderEmail) doc.text(senderEmail, W - mR, 47, { align: "right" });
      if (senderPhone) doc.text(senderPhone, W - mR, 52, { align: "right" });

      // ── Дата ─────────────────────────────────────────────────
      const today = new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(today, W - mR, 62, { align: "right" });

      // ── Тема (Betreff) ────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      const subject = `Bewerbung als ${job.titel}`;
      const subjectLines = doc.splitTextToSize(subject, usable);
      doc.text(subjectLines, mL, 72);
      const subjectH = subjectLines.length * 6;

      // акцент под темой
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.6);
      doc.line(mL, 72 + subjectH - 1, mL + 40, 72 + subjectH - 1);

      // ── Тело письма ───────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(35, 35, 35);
      const lineH = 5.8;
      let curY = 72 + subjectH + 6;

      const paragraphs = letter.split(/\n/);
      for (const para of paragraphs) {
        const lines = para.trim().length
          ? doc.splitTextToSize(para, usable)
          : [""];

        for (const line of lines) {
          if (curY + lineH > H - 25) {
            doc.addPage();
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, W, 3, "F");
            curY = 27;
          }
          doc.text(line, mL, curY);
          curY += lineH;
        }
        if (para.trim().length) curY += 1.5;
      }

      // ── Нижний колонтитул ─────────────────────────────────────
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(mL, H - 18, W - mR, H - 18);
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Bewerbung · ${job.titel} · ${job.arbeitgeber || ""}`,
        W / 2,
        H - 13,
        { align: "center" }
      );

      // ── Акцентная полоса снизу ────────────────────────────────
      doc.setFillColor(59, 130, 246);
      doc.rect(0, H - 4, W, 4, "F");

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
            onClick={() => setShowEditor(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent-soft px-5 text-sm font-bold text-accent-strong transition hover:bg-accent hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Motivationsschreiben erstellen
          </button>
        </div>
      </section>

      {/* Форма с данными отправителя */}
      {showEditor && !letter && !generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="font-black text-xl text-ink mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              Ihre Angaben
            </h3>
            <p className="text-sm text-muted mb-5">
              Diese werden ins Motivationsschreiben und in den PDF-Briefkopf übernommen.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                  Vor- und Nachname *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                    Straße & Hausnr.
                  </label>
                  <input
                    type="text"
                    value={senderStreet}
                    onChange={(e) => setSenderStreet(e.target.value)}
                    placeholder="Musterstraße 12"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                    PLZ & Stadt
                  </label>
                  <input
                    type="text"
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    placeholder="10115 Berlin"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+49 30 12345678"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-sm border border-border rounded-xl text-muted hover:text-ink transition"
              >
                Abbrechen
              </button>
              <button
                onClick={async () => {
                  setShowEditor(false);
                  await generateLetter();
                }}
                disabled={!senderName.trim()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-40"
              >
                Schreiben generieren →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Спиннер генерации */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface px-10 py-8 shadow-2xl flex flex-col items-center gap-4">
            <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeDasharray="28 8" />
            </svg>
            <p className="text-sm font-semibold text-muted">Motivationsschreiben wird erstellt…</p>
          </div>
        </div>
      )}

      {/* Предпросмотр и редактирование письма */}
      {letter && !generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl flex flex-col max-h-[90vh]">
            {/* Шапка модала */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div>
                <h3 className="font-black text-lg text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Motivationsschreiben
                </h3>
                <p className="text-xs text-muted mt-0.5">Bearbeiten Sie den Text direkt im Feld</p>
              </div>
              <button
                onClick={() => { setLetter(null); setShowEditor(false); }}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-ink transition"
                aria-label="Schließen"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Мета-данные отправителя */}
            <div className="px-6 py-3 bg-page/60 border-b border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="font-semibold text-ink">{senderName || "—"}</span>
              {senderStreet && <span>{senderStreet}</span>}
              {senderCity && <span>{senderCity}</span>}
              {senderEmail && <span>{senderEmail}</span>}
              {senderPhone && <span>{senderPhone}</span>}
              <button
                onClick={() => { setLetter(null); setShowEditor(true); }}
                className="ml-auto text-accent hover:underline font-semibold"
              >
                ✎ Angaben ändern
              </button>
            </div>

            {/* Редактируемое тело письма */}
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="flex-1 resize-none bg-transparent px-6 py-4 text-sm text-ink leading-relaxed focus:outline-none font-mono overflow-y-auto"
              spellCheck
              lang="de"
            />

            {/* Кнопки */}
            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">{letter.length} Zeichen</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setLetter(null); setShowEditor(false); }}
                  className="px-4 py-2 text-sm border border-border rounded-xl text-muted hover:text-ink transition"
                >
                  Verwerfen
                </button>
                <button
                  onClick={downloadLetterAsPdf}
                  disabled={downloading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" strokeDasharray="28 8" />
                      </svg>
                      Wird erstellt…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Als PDF herunterladen
                    </>
                  )}
                </button>
              </div>
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
