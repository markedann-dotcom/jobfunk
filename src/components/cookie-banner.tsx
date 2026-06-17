"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

const KEY = "jf_cookie_consent"; // "accepted" | "essential"

/** Open the banner again from anywhere (e.g. footer link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event("jf:open-cookies"));
}

export function CookieBanner() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let decided = false;
    try {
      decided = !!localStorage.getItem(KEY);
    } catch {}
    if (!decided) {
      const tmr = setTimeout(() => setShow(true), 400);
      return () => clearTimeout(tmr);
    }
  }, []);

  useEffect(() => {
    const open = () => setShow(true);
    window.addEventListener("jf:open-cookies", open);
    return () => window.removeEventListener("jf:open-cookies", open);
  }, []);

  const decide = (value: "accepted" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("cookie.title")}
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-18px_rgba(20,17,15,0.5)]">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z" strokeLinejoin="round" />
              <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
              <circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">{t("cookie.title")}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {t("cookie.text")}{" "}
              <Link href="/datenschutz" className="font-semibold text-accent hover:underline">
                {t("legal.datenschutz")}
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border bg-page/60 p-3 sm:flex-row-reverse sm:items-center sm:p-4">
          <button
            onClick={() => decide("accepted")}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong sm:px-6"
          >
            {t("cookie.accept")}
          </button>
          <button
            onClick={() => decide("essential")}
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            {t("cookie.essential")}
          </button>
          <p className="text-[11px] leading-snug text-muted sm:mr-auto sm:max-w-[14rem]">
            {t("cookie.note")}
          </p>
        </div>
      </div>
    </div>
  );
}
