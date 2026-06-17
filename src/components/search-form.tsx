"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import type { Angebotsart } from "@/lib/api";
import { searchCities, type CityEntry } from "@/lib/cities";
import { relatedBerufe } from "@/lib/related-berufe";
type BerufEntry = { label: string };

const RADII = ["0", "5", "10", "25", "50", "100", "200"];
const TYPES: Angebotsart[] = ["", "1", "4", "34", "2"];
const ARBEITSZEIT: { v: string; key: string }[] = [
  { v: "vz", key: "filt.az.vz" },
  { v: "tz", key: "filt.az.tz" },
  { v: "ho", key: "filt.az.ho" },
  { v: "snw", key: "filt.az.snw" },
  { v: "mj", key: "filt.az.mj" },
];
const SINCE = ["", "1", "3", "7", "14", "30"];

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
  const [umkreis, setUmkreis] = useState(initial?.umkreis ?? "25");
  const [angebotsart, setAngebotsart] = useState(initial?.angebotsart ?? "");
  const [arbeitszeit, setArbeitszeit] = useState<string[]>(
    initial?.arbeitszeit ? initial.arbeitszeit.split(";").filter(Boolean) : []
  );
  const [seit, setSeit] = useState(initial?.veroeffentlichtseit ?? "");
  const [befristung, setBefristung] = useState(initial?.befristung ?? "");
  const [showAdvanced, setShowAdvanced] = useState(
    variant === "compact" &&
      Boolean(initial?.arbeitszeit || initial?.veroeffentlichtseit || initial?.befristung)
  );
  const [busy, setBusy] = useState(false);

  function toggleAz(v: string) {
    setArbeitszeit((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  }

  // city autocomplete
  const [suggestions, setSuggestions] = useState<CityEntry[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const woRef = useRef<HTMLDivElement>(null);
  const woListRef = useRef<HTMLUListElement>(null);

  // beruf (occupation) autocomplete for the "Was?" field — instant, local
  const [berufSug, setBerufSug] = useState<BerufEntry[]>([]);
  const [showBeruf, setShowBeruf] = useState(false);
  const [berufIdx, setBerufIdx] = useState(-1);
  const wasRef = useRef<HTMLDivElement>(null);
  const wasListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      // Only close if click is outside the entire wrapper (not on scrollbar inside list)
      if (woRef.current && !woRef.current.contains(ev.target as Node)) {
        setShowSug(false);
      }
      if (wasRef.current && !wasRef.current.contains(ev.target as Node)) {
        setShowBeruf(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onWasChange(v: string) {
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
  }

  function pickBeruf(label: string) {
    setWas(label);
    setShowBeruf(false);
    setBerufSug([]);
    setBerufIdx(-1);
  }

  function onWasKey(ev: React.KeyboardEvent) {
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
  }

  function onWoChange(v: string) {
    setWo(v);
    const sug = searchCities(v);
    setSuggestions(sug);
    setShowSug(sug.length > 0);
    setActiveIdx(-1);
  }

  function pickCity(c: CityEntry) {
    setWo(c.plz);
    setShowSug(false);
    setSuggestions([]);
  }

  function onWoKey(ev: React.KeyboardEvent) {
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
  }

  function scrollItemIntoView(listRef: React.RefObject<HTMLUListElement | null>, idx: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[idx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const qs = new URLSearchParams();
    if (was.trim()) qs.set("was", was.trim());
    if (wo.trim()) qs.set("wo", wo.trim());
    qs.set("umkreis", umkreis);
    if (angebotsart) qs.set("angebotsart", angebotsart);
    if (arbeitszeit.length) qs.set("arbeitszeit", arbeitszeit.join(";"));
    if (seit) qs.set("veroeffentlichtseit", seit);
    if (befristung) qs.set("befristung", befristung);
    if (initial?.sort) qs.set("sort", initial.sort);
    qs.set("page", "1");
    router.push(`/suche?${qs.toString()}`);
  }

  const fieldBase =
    "h-13 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15";

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-border bg-surface/95 p-4 shadow-[0_18px_50px_-20px_rgba(120,72,20,0.25)] backdrop-blur sm:p-5 ${
        variant === "hero" ? "" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.was.label")}
          </span>
          <div className="relative" ref={wasRef}>
            <SearchIcon />
            <input
              value={was}
              onChange={(e) => onWasChange(e.target.value)}
              onFocus={() => berufSug.length && setShowBeruf(true)}
              onKeyDown={onWasKey}
              placeholder={t("form.was.ph")}
              autoComplete="off"
              className={`${fieldBase} pl-11`}
            />
            {showBeruf && berufSug.length > 0 && (
              <ul
                ref={wasListRef}
                className="absolute z-40 mt-1.5 w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-[0_20px_50px_-15px_rgba(60,40,20,0.3)]"
                style={{ maxHeight: "260px" }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {berufSug.map((b, i) => (
                  <li key={b.label}>
                    <button
                      type="button"
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        pickBeruf(b.label);
                      }}
                      onMouseEnter={() => setBerufIdx(i)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                        i === berufIdx ? "bg-accent-soft" : "hover:bg-page"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent-strong">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="truncate font-semibold text-ink">{b.label}</span>
                      </span>

                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.wo.label")}
          </span>
          <div className="relative" ref={woRef}>
            <PinIcon />
            <input
              value={wo}
              onChange={(e) => onWoChange(e.target.value)}
              onFocus={() => suggestions.length && setShowSug(true)}
              onKeyDown={onWoKey}
              placeholder={t("form.wo.ph")}
              autoComplete="off"
              className={`${fieldBase} pl-11`}
            />
            {showSug && suggestions.length > 0 && (
              <ul
                ref={woListRef}
                className="absolute z-40 mt-1.5 w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-[0_20px_50px_-15px_rgba(60,40,20,0.3)]"
                style={{ maxHeight: "260px" }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {suggestions.map((c, i) => (
                  <li key={c.plz + c.name}>
                    <button
                      type="button"
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        pickCity(c);
                      }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                        i === activeIdx ? "bg-accent-soft" : "hover:bg-page"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent-soft text-accent-strong">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
                            <circle cx="12" cy="10.5" r="2" />
                          </svg>
                        </span>
                        <span>
                          <span className="font-semibold text-ink">{c.name}</span>
                          <span className="ml-1 text-xs text-muted">{c.region}</span>
                        </span>
                      </span>
                      <span className="font-mono text-xs font-bold text-muted">{c.plz}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1.4fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            {t("form.radius.label")}
          </span>
          <select
            value={umkreis}
            onChange={(e) => setUmkreis(e.target.value)}
            className={`${fieldBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10`}
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
            className={`${fieldBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10`}
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
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(234,88,12,0.6)] transition hover:bg-accent-strong active:scale-[0.98] disabled:opacity-60 md:w-auto"
          >
            {busy ? t("form.searching") : t("form.submit")}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced filters toggle */}
      <div className="mt-3 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent-strong transition hover:text-accent"
          aria-expanded={showAdvanced}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          {t("filt.toggle")}
          {(arbeitszeit.length > 0 || seit || befristung) && (
            <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
              {arbeitszeit.length + (seit ? 1 : 0) + (befristung ? 1 : 0)}
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition ${showAdvanced ? "rotate-180" : ""}`}
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
              <div className="flex flex-wrap gap-2">
                {ARBEITSZEIT.map((a) => {
                  const on = arbeitszeit.includes(a.v);
                  return (
                    <button
                      key={a.v}
                      type="button"
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
                      {t(a.key)}
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
                className={`${fieldBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10`}
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
                className={`${fieldBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6259%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10`}
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

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
    >
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}