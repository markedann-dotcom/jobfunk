"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useT } from "@/lib/i18n";
import type { Angebotsart } from "@/lib/api";
import { searchCities, type CityEntry } from "@/lib/cities";
import { relatedBerufe } from "@/lib/related-berufe";

type BerufEntry = { label: string };

const RADII = ["0", "5", "10", "25", "50", "100", "200"];
const TYPES: Angebotsart[] = ["", "1", "4", "34", "2"];
const ARBEITSZEIT: { v: string; key: string; label: string }[] = [
  { v: "vz", key: "az.vz", label: "Vollzeit" },
  { v: "tz", key: "az.tz", label: "Teilzeit" },
  { v: "ho", key: "az.ho", label: "Homeoffice" },
  { v: "snw", key: "az.snw", label: "Schicht / Nacht / Wochenende" },
  { v: "mj", key: "az.mj", label: "Minijob" },
];
const SINCE = ["", "1", "3", "7", "14", "30"];

const SELECT_CLS =
  "h-13 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10";

const INPUT_CLS =
  "h-13 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15";

/** Закрывает выпадашку при клике вне ref-элемента */
function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

function scrollItemIntoView(listRef: React.RefObject<HTMLUListElement | null>, idx: number) {
  const item = listRef.current?.children[idx] as HTMLElement | undefined;
  item?.scrollIntoView({ block: "nearest" });
}

// ---------------------------------------------------------------------------

export function SearchForm({
  initial,
  variant = "hero",
}: {
  initial?: {
    was?: string;
    wo?: string;
    umkreis?: string;
    angebotsart?: string;
    arbeitszeit?: string;
    veroeffentlichtseit?: string;
    befristung?: string;
    sort?: string;
  };
  variant?: "hero" | "compact";
}) {
  const { t } = useT();
  const router = useRouter();

  const [was, setWas] = useState(initial?.was ?? "");
  const [wo, setWo] = useState(initial?.wo ?? "");
  const [umkreis, setUmkreis] = useState(() => {
    if ((initial?.wo ?? "").toLowerCase() === "remote") return "0";
    return initial?.umkreis ?? "25";
  });
  const [angebotsart, setAngebotsart] = useState(initial?.angebotsart ?? "");
  const [arbeitszeit, setArbeitszeit] = useState<string[]>(
    initial?.arbeitszeit ? initial.arbeitszeit.split(";").filter(Boolean) : [],
  );
  const [seit, setSeit] = useState(initial?.veroeffentlichtseit ?? "");
  const [befristung, setBefristung] = useState(initial?.befristung ?? "");
  const [showAdvanced, setShowAdvanced] = useState(
    variant === "compact" &&
      Boolean(initial?.arbeitszeit || initial?.veroeffentlichtseit || initial?.befristung),
  );
  const [busy, setBusy] = useState(false);

  const isRemote = wo.toLowerCase() === "remote";

  // --- Beruf (Was?) autocomplete ------------------------------------------------
  const [berufSug, setBerufSug] = useState<BerufEntry[]>([]);
  const [showBeruf, setShowBeruf] = useState(false);
  const [berufIdx, setBerufIdx] = useState(-1);
  const wasRef = useRef<HTMLDivElement>(null);
  const wasListRef = useRef<HTMLUListElement>(null);

  const closeBerufe = useCallback(() => setShowBeruf(false), []);
  useClickOutside(wasRef, closeBerufe);

  const onWasChange = useCallback((v: string) => {
    setWas(v);
    setBerufIdx(-1);
    const q = v.trim();
    if (q.length < 2) {
      setBerufSug([]);
      setShowBeruf(false);
      return;
    }
    const results = relatedBerufe(q).map((label) => ({ label }));
    setBerufSug(results);
    setShowBeruf(results.length > 0);
  }, []);

  const pickBeruf = useCallback((label: string) => {
    setWas(label);
    setShowBeruf(false);
    setBerufSug([]);
    setBerufIdx(-1);
  }, []);

  const onWasKey = useCallback(
    (ev: React.KeyboardEvent) => {
      if (!showBeruf || berufSug.length === 0) return;
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        const next = (berufIdx + 1) % berufSug.length;
        setBerufIdx(next);
        scrollItemIntoView(wasListRef, next);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        const next = berufIdx <= 0 ? berufSug.length - 1 : berufIdx - 1;
        setBerufIdx(next);
        scrollItemIntoView(wasListRef, next);
      } else if (ev.key === "Enter" && berufIdx >= 0) {
        ev.preventDefault();
        pickBeruf(berufSug[berufIdx].label);
      } else if (ev.key === "Escape") {
        setShowBeruf(false);
      }
    },
    [showBeruf, berufSug, berufIdx, pickBeruf],
  );

  // --- City (Wo?) autocomplete --------------------------------------------------
  const [suggestions, setSuggestions] = useState<CityEntry[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const woRef = useRef<HTMLDivElement>(null);
  const woListRef = useRef<HTMLUListElement>(null);

  const closeSug = useCallback(() => setShowSug(false), []);
  useClickOutside(woRef, closeSug);

  const onWoChange = useCallback((v: string) => {
    setWo(v);
    if (v.toLowerCase() === "remote") setUmkreis("0");

    const lower = v.toLowerCase();
    let sug = searchCities(v);
    if (lower.startsWith("rem") || lower.startsWith("уда") || lower.startsWith("hom")) {
      sug = [{ plz: "Remote", name: "Homeoffice", region: "Weltweit / Bundesweit" }, ...sug];
    }
    setSuggestions(sug);
    setShowSug(sug.length > 0);
    setActiveIdx(-1);
  }, []);

  const pickCity = useCallback((c: CityEntry) => {
    setWo(c.plz);
    if (c.plz.toLowerCase() === "remote") setUmkreis("0");
    setShowSug(false);
    setSuggestions([]);
  }, []);

  const onWoKey = useCallback(
    (ev: React.KeyboardEvent) => {
      if (!showSug || suggestions.length === 0) return;
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        const next = (activeIdx + 1) % suggestions.length;
        setActiveIdx(next);
        scrollItemIntoView(woListRef, next);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        const next = activeIdx <= 0 ? suggestions.length - 1 : activeIdx - 1;
        setActiveIdx(next);
        scrollItemIntoView(woListRef, next);
      } else if (ev.key === "Enter" && activeIdx >= 0) {
        ev.preventDefault();
        pickCity(suggestions[activeIdx]);
      } else if (ev.key === "Escape") {
        setShowSug(false);
      }
    },
    [showSug, suggestions, activeIdx, pickCity],
  );

  // --- Arbeitszeit toggle -------------------------------------------------------
  const toggleAz = useCallback((v: string) => {
    setArbeitszeit((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  }, []);

  // --- Submit -------------------------------------------------------------------
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const qs = new URLSearchParams();
    if (was.trim()) qs.set("was", was.trim());
    if (wo.trim()) qs.set("wo", wo.trim());
    qs.set("umkreis", isRemote ? "0" : umkreis);
    if (angebotsart) qs.set("angebotsart", angebotsart);
    if (arbeitszeit.length) qs.set("arbeitszeit", arbeitszeit.join(";"));
    if (seit) qs.set("veroeffentlichtseit", seit);
    if (befristung) qs.set("befristung", befristung);
    if (initial?.sort) qs.set("sort", initial.sort);
    qs.set("page", "1");
    router.push(`/suche?${qs.toString()}`);
  }

  const activeFiltersCount = arbeitszeit.length + (seit ? 1 : 0) + (befristung ? 1 : 0);

  // ---------------------------------------------------------------------------
  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-surface/95 p-4 shadow-[0_18px_50px_-20px_rgba(120,72,20,0.25)] backdrop-blur sm:p-5"
    >
      {/* Row 1: Was + Wo */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Was? */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.was.label")}
          </span>
          <div className="relative" ref={wasRef}>
            <SearchIcon />
            <input
              value={was}
              onChange={(e) => onWasChange(e.target.value)}
              onFocus={() => berufSug.length > 0 && setShowBeruf(true)}
              onKeyDown={onWasKey}
              placeholder={t("form.was.ph")}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={showBeruf ? "beruf-list" : undefined}
              aria-activedescendant={berufIdx >= 0 ? `beruf-item-${berufIdx}` : undefined}
              className={`${INPUT_CLS} pl-11 pr-10`}
            />
            {was && <ClearButton onClick={() => { setWas(""); setBerufSug([]); setShowBeruf(false); }} />}

            {showBeruf && berufSug.length > 0 && (
              <ul
                id="beruf-list"
                role="listbox"
                ref={wasListRef}
                className="absolute z-40 mt-1.5 w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-[0_20px_50px_-15px_rgba(60,40,20,0.3)]"
                style={{ maxHeight: 260 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {berufSug.map((b, i) => (
                  <li key={b.label} id={`beruf-item-${i}`} role="option" aria-selected={i === berufIdx}>
                    <button
                      type="button"
                      onMouseDown={(ev) => { ev.preventDefault(); pickBeruf(b.label); }}
                      onMouseEnter={() => setBerufIdx(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                        i === berufIdx ? "bg-accent-soft" : "hover:bg-page"
                      }`}
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent-strong">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="truncate font-semibold text-ink">{b.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>

        {/* Wo? */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.wo.label")}
          </span>
          <div className="relative" ref={woRef}>
            <PinIcon />
            <input
              value={wo}
              onChange={(e) => onWoChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              onKeyDown={onWoKey}
              placeholder={t("form.wo.ph")}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={showSug ? "city-list" : undefined}
              aria-activedescendant={activeIdx >= 0 ? `city-item-${activeIdx}` : undefined}
              className={`${INPUT_CLS} pl-11 pr-10`}
            />
            {wo && <ClearButton onClick={() => { setWo(""); setSuggestions([]); setShowSug(false); }} />}

            {showSug && suggestions.length > 0 && (
              <ul
                id="city-list"
                role="listbox"
                ref={woListRef}
                className="absolute z-40 mt-1.5 w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-[0_20px_50px_-15px_rgba(60,40,20,0.3)]"
                style={{ maxHeight: 260 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {suggestions.map((c, i) => (
                  <li key={c.plz + c.name} id={`city-item-${i}`} role="option" aria-selected={i === activeIdx}>
                    <button
                      type="button"
                      onMouseDown={(ev) => { ev.preventDefault(); pickCity(c); }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                        i === activeIdx ? "bg-accent-soft" : "hover:bg-page"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent-strong">
                          {c.plz === "Remote" ? <HomeIcon /> : <MapPinSmallIcon />}
                        </span>
                        <span>
                          <span className="font-semibold text-ink">{c.name}</span>
                          <span className="ml-1 text-xs text-muted">{c.region}</span>
                        </span>
                      </span>
                      {c.plz !== "Remote" && (
                        <span className="font-mono text-xs font-bold text-muted">{c.plz}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
      </div>

      {/* Row 2: Umkreis + Angebotsart + Submit */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1.4fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.radius.label")}
          </span>
          <select
            value={umkreis}
            onChange={(e) => setUmkreis(e.target.value)}
            disabled={isRemote}
            className={`${SELECT_CLS} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r === "0" ? t("form.radius.0") : `${r} ${t("form.radius.unit")}`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.type.label")}
          </span>
          <select
            value={angebotsart}
            onChange={(e) => setAngebotsart(e.target.value)}
            className={SELECT_CLS}
          >
            {TYPES.map((ty) => (
              <option key={ty || "all"} value={ty}>
                {ty ? t(`type.${ty}`) : t("type.all")}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(234,88,12,0.6)] transition hover:bg-accent-strong active:scale-[0.98] disabled:opacity-80 md:w-auto"
          >
            {busy ? t("form.searching") : t("form.submit")}
            {busy ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="mt-3 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          aria-expanded={showAdvanced}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent-strong transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          {t("filt.toggle")}
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Arbeitszeit */}
            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
                {t("filt.arbeitszeit")}
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t("filt.arbeitszeit")}>
                {ARBEITSZEIT.map((a) => {
                  const on = arbeitszeit.includes(a.v);
                  return (
                    <button
                      key={a.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleAz(a.v)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
                        on
                          ? "border-accent bg-accent text-white shadow-[0_6px_16px_-8px_rgba(234,88,12,0.7)]"
                          : "border-border bg-surface text-ink hover:border-accent/60 hover:bg-accent-soft"
                      }`}
                    >
                      {on && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {(() => { const tr = t(a.key); return tr && tr !== a.key ? tr : a.label; })()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Veröffentlicht seit */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
                {t("filt.since")}
              </span>
              <select
                value={seit}
                onChange={(e) => setSeit(e.target.value)}
                className={SELECT_CLS}
              >
                {SINCE.map((d) => (
                  <option key={d || "any"} value={d}>
                    {t(`filt.since.${d || "0"}`)}
                  </option>
                ))}
              </select>
            </label>

            {/* Befristung */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
                {t("filt.befristung")}
              </span>
              <select
                value={befristung}
                onChange={(e) => setBefristung(e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">{t("filt.befr.all")}</option>
                <option value="1">{t("filt.befr.1")}</option>
                <option value="2">{t("filt.befr.2")}</option>
              </select>
            </label>
          </div>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      aria-label="Clear"
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted transition hover:text-ink"
    >
      <XIcon />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Icons

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MapPinSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
