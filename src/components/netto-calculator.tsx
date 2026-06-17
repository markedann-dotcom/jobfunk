"use client";

import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { calcNetto, eur2, type Steuerklasse } from "@/lib/netto";

export function NettoCalculator({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const [brutto, setBrutto] = useState("3000");
  const [stkl, setStkl] = useState<Steuerklasse>(1);
  const [kirche, setKirche] = useState(false);
  const [kinderlos, setKinderlos] = useState(true);

  const res = useMemo(
    () =>
      calcNetto({
        brutto: Number(brutto.replace(/[^\d.]/g, "")) || 0,
        steuerklasse: stkl,
        kirchensteuer: kirche,
        kinderlos,
      }),
    [brutto, stkl, kirche, kinderlos]
  );

  const nettoPct = res.brutto > 0 ? Math.round((res.netto / res.brutto) * 100) : 0;

  const field =
    "h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] font-semibold text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";

  return (
    <div
      className={`rounded-2xl border border-border bg-surface/90 p-5 backdrop-blur-sm sm:p-6 ${
        compact ? "" : "shadow-[0_2px_12px_-4px_rgba(60,40,20,0.1)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-strong">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-bold text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
            {t("netto.title")}
          </h3>
          <p className="text-xs text-muted">{t("netto.sub")}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{t("netto.brutto")}</span>
          <div className="relative">
            <input
              inputMode="numeric"
              value={brutto}
              onChange={(e) => setBrutto(e.target.value)}
              className={`${field} pr-12`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">€</span>
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{t("netto.stkl")}</span>
          <select
            value={stkl}
            onChange={(e) => setStkl(Number(e.target.value) as Steuerklasse)}
            className={`${field} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {t("netto.stkl.n")} {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Toggle on={kirche} onClick={() => setKirche((v) => !v)} label={t("netto.kirche")} />
        <Toggle on={kinderlos} onClick={() => setKinderlos((v) => !v)} label={t("netto.kinderlos")} />
      </div>

      {/* result */}
      <div className="mt-5 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-accent-strong">{t("netto.result")}</p>
            <p className="mt-1 text-3xl font-black text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
              {eur2(res.netto)}
            </p>
            <p className="text-xs text-muted">{t("netto.permonth")}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-accent">{nettoPct}%</p>
            <p className="text-xs text-muted">{t("netto.ofbrutto")}</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${nettoPct}%` }} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <Row label={t("netto.lohnsteuer")} value={`− ${eur2(res.lohnsteuer)}`} />
          <Row label={t("netto.sozial")} value={`− ${eur2(res.sozialabgaben)}`} />
          {res.kirchensteuer > 0 && <Row label={t("netto.kirchensteuer")} value={`− ${eur2(res.kirchensteuer)}`} />}
          {res.soli > 0 && <Row label="Soli" value={`− ${eur2(res.soli)}`} />}
        </dl>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">{t("netto.disclaimer")}</p>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
        on
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface text-ink hover:border-accent/60"
      }`}
    >
      {on && (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink/80">{value}</dd>
    </>
  );
}
