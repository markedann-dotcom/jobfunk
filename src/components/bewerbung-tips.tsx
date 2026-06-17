"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

const STEPS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

// CV / application checklist tailored loosely to the job's beruf.
export function BewerbungTips({ beruf }: { beruf?: string }) {
  const { t } = useT();
  const [done, setDone] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pct = Math.round((done.size / STEPS.length) * 100);

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-strong">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3 8-8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-bold text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
            {t("tips.title")}
          </h3>
          <p className="text-xs text-muted">
            {beruf ? `${t("tips.for")} ${beruf}` : t("tips.sub")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-page">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-accent">{pct}%</span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {STEPS.map((s) => {
          const checked = done.has(s);
          return (
            <li key={s}>
              <button
                onClick={() => toggle(s)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                    checked ? "border-accent bg-accent text-white" : "border-border bg-surface"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm leading-relaxed ${checked ? "text-muted line-through" : "text-ink/90"}`}>
                  {t(`tips.${s}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
