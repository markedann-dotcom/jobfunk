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
    return () => { alive = false; };
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
  const [showPreview, setShowPreview] = useState(false);

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
      setShowPreview(true);
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
      const sidebarW = 58;
      const mL = sidebarW + 14;
      const mR = 14;
      const usable = W - mL - mR;

      // ── Синий сайдбар слева ───────────────────────────────────
      doc.setFillColor(23, 37, 84); // тёмно-синий
      doc.rect(0, 0, sidebarW, H, "F");

      // тонкая акцентная линия справа от сайдбара
      doc.setFillColor(59, 130, 246);
      doc.rect(sidebarW, 0, 2.5, H, "F");

      // ── Имя в сайдбаре ───────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      const nameLines = doc.splitTextToSize(senderName || "Ihr Name", sidebarW - 12);
      doc.text(nameLines, 7, 28);

      // разделитель
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.8);
      doc.line(7, 28 + nameLines.length * 6 + 2, sidebarW - 7, 28 + nameLines.length * 6 + 2);

      // контакты в сайдбаре
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 255);

      let sideY = 28 + nameLines.length * 6 + 10;
      const sideItems = [
        { label: "Adresse", value: [senderStreet, senderCity].filter(Boolean).join("\n") },
        { label: "E-Mail", value: senderEmail },
        { label: "Telefon", value: senderPhone },
      ].filter((x) => x.value);

      for (const item of sideItems) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 140, 220);
        doc.text(item.label.toUpperCase(), 7, sideY);
        sideY += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(210, 225, 255);
        const valLines = doc.splitTextToSize(item.value, sidebarW - 14);
        doc.text(valLines, 7, sideY);
        sideY += valLines.length * 4.5 + 5;
      }

      // дата в низу сайдбара
      const today = new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 160, 220);
      doc.text(today, 7, H - 14);

      // ── Получатель ───────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(job.arbeitgeber || "Unternehmen", mL, 32);
      if (job.strasse) doc.text(job.strasse, mL, 37);
      const rcvCity = [job.plz, job.ort].filter(Boolean).join(" ");
      if (rcvCity) doc.text(rcvCity, mL, job.strasse ? 42 : 37);

      // ── Тема ────────────────────────────────────────────────
      const subjectTop = 60;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 60);
      const subject = `Bewerbung als ${job.titel}`;
      const subjectLines = doc.splitTextToSize(subject, usable);
      doc.text(subjectLines, mL, subjectTop);
      const subjectH = subjectLines.length * 6.5;

      // подчёркивание темы
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.line(mL, subjectTop + subjectH, mL + 50, subjectTop + subjectH);

      // ── Тело письма ─────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(35, 35, 35);
      const lineH = 5.6;
      let curY = subjectTop + subjectH + 9;

      for (const para of letter.split(/\n/)) {
        const lines = para.trim().length
          ? doc.splitTextToSize(para, usable)
          : [""];
        for (const line of lines) {
          if (curY + lineH > H - 20) {
            doc.addPage();
            // сайдбар на новой странице
            doc.setFillColor(23, 37, 84);
            doc.rect(0, 0, sidebarW, H, "F");
            doc.setFillColor(59, 130, 246);
            doc.rect(sidebarW, 0, 2.5, H, "F");
            curY = 24;
          }
          doc.text(line, mL, curY);
          curY += lineH;
        }
        if (para.trim().length) curY += 2;
      }

      // ── Нижний колонтитул ────────────────────────────────────
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(mL, H - 14, W - mR, H - 14);
      doc.setFontSize(7);
      doc.setTextColor(170, 170, 170);
      doc.text(`${job.titel} · ${job.arbeitgeber || ""}`, mL, H - 9);

      const safeCompany = (job.arbeitgeber || "Unternehmen").replace(/[^\p{L}\p{N}_-]+/gu, "_");
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
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${fav ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface text-muted hover:border-accent hover:text-accent"}`}
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
          <Field icon={<ClockIcon />} label={t("detail.published")} value={formatDate(job.published, lang)} />
          {job.eintrittsdatum && <Field icon={<CalIcon />} label={t("detail.start")} value={formatDate(job.eintrittsdatum, lang)} />}
          {job.arbeitszeit && <Field icon={<TimeIcon />} label={t("detail.worktime")} value={job.arbeitszeit} />}
          {job.verguetung && <Field icon={<EuroIcon />} label={t("detail.salary")} value={job.verguetung} />}
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

      {/* ── Шаг 1: Форма данных ── */}
      {showEditor && !generating && !showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-7 shadow-2xl">
            <div className="mb-5">
              <h3 className="font-black text-xl text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
                Ihre Kontaktdaten
              </h3>
              <p className="text-sm text-muted mt-1">
                Erscheinen im Briefkopf des PDFs.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1.5">
                  Vor- und Nachname <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Max Mustermann"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1.5">Straße & Hausnr.</label>
                  <input
                    type="text"
                    value={senderStreet}
                    onChange={(e) => setSenderStreet(e.target.value)}
                    placeholder="Musterstraße 12"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1.5">PLZ & Stadt</label>
                  <input
                    type="text"
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    placeholder="10115 Berlin"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+49 30 12345678"
                    className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-5 py-2.5 text-sm border border-border rounded-xl text-muted hover:text-ink transition"
              >
                Abbrechen
              </button>
              <button
                onClick={async () => {
                  setShowEditor(false);
                  await generateLetter();
                }}
                disabled={!senderName.trim()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-40"
              >
                Schreiben generieren →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Спиннер генерации ── */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface px-12 py-10 shadow-2xl flex flex-col items-center gap-4">
            <svg className="h-9 w-9 animate-spin text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeDasharray="28 8" />
            </svg>
            <p className="text-sm font-semibold text-muted">Motivationsschreiben wird erstellt…</p>
          </div>
        </div>
      )}

      {/* ── Шаг 2: Предпросмотр на весь экран ── */}
      {showPreview && letter && !generating && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a2e]">
          {/* Топбар */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#16213e] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-white/40 font-mono">Motivationsschreiben_Vorschau.pdf</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowPreview(false); setShowEditor(true); setLetter(null); }}
                className="px-3 py-1.5 text-xs border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition"
              >
                ✎ Angaben ändern
              </button>
              <button
                onClick={() => { setShowPreview(false); setLetter(null); setShowEditor(false); }}
                className="px-3 py-1.5 text-xs border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition"
              >
                Verwerfen
              </button>
              <button
                onClick={downloadLetterAsPdf}
                disabled={downloading}
                className="inline-flex h-8 items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-400 px-4 text-xs font-bold text-white transition disabled:opacity-50"
              >
                {downloading ? (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" strokeDasharray="28 8" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {downloading ? "Erstellt…" : "Als PDF herunterladen"}
              </button>
            </div>
          </div>

          {/* Область предпросмотра */}
          <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
            {/* Лист A4 */}
            <div
              className="relative bg-white shadow-2xl flex"
              style={{ width: "210mm", minHeight: "297mm", fontFamily: "Georgia, serif" }}
            >
              {/* Тёмно-синий сайдбар */}
              <div className="shrink-0 flex flex-col" style={{ width: "58mm", background: "#172554" }}>
                {/* Акцентная линия */}
                <div style={{ width: "3px", position: "absolute", left: "58mm", top: 0, bottom: 0, background: "#3b82f6" }} />

                <div className="p-5 flex-1">
                  {/* Имя */}
                  <div className="mb-4">
                    <p className="text-white font-bold leading-tight" style={{ fontSize: "13px" }}>
                      {senderName || <span className="text-white/30">Ihr Name</span>}
                    </p>
                    <div className="mt-2 h-px bg-blue-500" />
                  </div>

                  {/* Контакты */}
                  <div className="space-y-4">
                    {(senderStreet || senderCity) && (
                      <div>
                        <p className="uppercase tracking-widest font-bold" style={{ fontSize: "6px", color: "#6496dc" }}>Adresse</p>
                        <p className="mt-1 leading-snug" style={{ fontSize: "8px", color: "#b8d0ff" }}>
                          {senderStreet && <>{senderStreet}<br /></>}
                          {senderCity}
                        </p>
                      </div>
                    )}
                    {senderEmail && (
                      <div>
                        <p className="uppercase tracking-widest font-bold" style={{ fontSize: "6px", color: "#6496dc" }}>E-Mail</p>
                        <p className="mt-1 break-all" style={{ fontSize: "8px", color: "#b8d0ff" }}>{senderEmail}</p>
                      </div>
                    )}
                    {senderPhone && (
                      <div>
                        <p className="uppercase tracking-widest font-bold" style={{ fontSize: "6px", color: "#6496dc" }}>Telefon</p>
                        <p className="mt-1" style={{ fontSize: "8px", color: "#b8d0ff" }}>{senderPhone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Дата внизу сайдбара */}
                <div className="p-5 pt-0">
                  <p style={{ fontSize: "7px", color: "#6496dc" }}>
                    {new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Основной контент */}
              <div className="flex-1 p-8 flex flex-col" style={{ paddingLeft: "14mm", paddingRight: "14mm", paddingTop: "10mm" }}>
                {/* Получатель */}
                <div className="mb-7" style={{ fontSize: "9px", color: "#555", lineHeight: 1.6 }}>
                  <p style={{ fontFamily: "Arial, sans-serif" }}>{job.arbeitgeber || "Unternehmen"}</p>
                  {job.strasse && <p style={{ fontFamily: "Arial, sans-serif" }}>{job.strasse}</p>}
                  {(job.plz || job.ort) && (
                    <p style={{ fontFamily: "Arial, sans-serif" }}>{[job.plz, job.ort].filter(Boolean).join(" ")}</p>
                  )}
                </div>

                {/* Тема */}
                <div className="mb-6">
                  <p className="font-bold text-[#0f1740] leading-snug" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                    Bewerbung als {job.titel}
                  </p>
                  <div className="mt-1.5 h-0.5 w-20 bg-blue-500 rounded-full" />
                </div>

                {/* Тело письма — редактируемое */}
                <div className="flex-1 relative">
                  <textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    className="absolute inset-0 w-full h-full resize-none border-none outline-none bg-transparent text-gray-800 leading-relaxed"
                    style={{ fontSize: "10px", fontFamily: "Arial, sans-serif", lineHeight: "1.75" }}
                    spellCheck
                    lang="de"
                  />
                </div>

                {/* Нижний колонтитул */}
                <div className="mt-6 pt-3 border-t border-gray-200">
                  <p style={{ fontSize: "7px", color: "#aaa", fontFamily: "Arial, sans-serif" }}>
                    {job.titel} · {job.arbeitgeber}
                  </p>
                </div>
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
    return () => { alive = false; };
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

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
