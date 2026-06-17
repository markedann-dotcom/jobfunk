"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

const KEY = "jf_onboarded";

export function Onboarding() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const id = setTimeout(() => setShow(true), 700);
        return () => clearTimeout(id);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  const steps = [
    { icon: "search", t: t("onb.s1.t"), d: t("onb.s1.d") },
    { icon: "heart", t: t("onb.s2.t"), d: t("onb.s2.d") },
    { icon: "bell", t: t("onb.s3.t"), d: t("onb.s3.d") },
  ];

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button
        aria-label="close"
        onClick={dismiss}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(60,40,20,0.5)] sm:p-8">
        <div className="hero-mesh absolute inset-x-0 top-0 h-24 opacity-60" aria-hidden />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("onb.badge")}
          </span>
          <h2 className="mt-3 text-2xl font-black text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
            {t("onb.title")}
          </h2>
          <p className="mt-1.5 text-sm text-muted">{t("onb.sub")}</p>

          <ul className="mt-5 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <StepIcon name={s.icon} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{s.t}</span>
                  <span className="block text-xs leading-relaxed text-muted">{s.d}</span>
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={dismiss}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-white transition hover:bg-accent-strong active:scale-[0.98]"
          >
            {t("onb.cta")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ name }: { name: string }) {
  const cls = "h-5 w-5";
  const p = { fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "search") return <svg viewBox="0 0 24 24" className={cls} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>;
  if (name === "heart") return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" /></svg>;
  return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
}
