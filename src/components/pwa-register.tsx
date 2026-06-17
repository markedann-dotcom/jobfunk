"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { usePwa } from "@/lib/pwa";

export function PwaRegister() {
  const { t } = useT();
  const { canInstall, installed, isIos, platform, promptInstall } = usePwa();
  const [show, setShow] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("jf_pwa_dismissed") === "1";
    } catch {}
    if (dismissed || installed) return;
    if (canInstall) setShow(true);
    else if (isIos) {
      const timer = setTimeout(() => setShow(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isIos, installed]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("jf_pwa_dismissed", "1");
    } catch {}
  };

  const install = async () => {
    const res = await promptInstall();
    if (res === "unavailable") {
      // No native prompt → reveal manual how-to instead of silently closing
      setManual(true);
      return;
    }
    dismiss();
  };

  if (!show || installed) return null;

  const howto =
    isIos || platform === "ios"
      ? t("pwa.ios")
      : platform === "android"
        ? t("pwa.android")
        : t("pwa.desktop");
  const showManual = isIos || manual;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md sm:left-auto sm:right-4 sm:mx-0">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[0_18px_50px_-15px_rgba(20,17,15,0.45)]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
            <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{t("pwa.title")}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {showManual ? howto : t("pwa.sub")}
          </p>
          {!showManual && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={install}
                className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-accent-strong"
              >
                {t("pwa.install")}
              </button>
              <button
                onClick={dismiss}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-ink"
              >
                {t("pwa.later")}
              </button>
            </div>
          )}
          {showManual && (
            <button
              onClick={dismiss}
              className="mt-2.5 rounded-full bg-page px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-ink"
            >
              {t("pwa.later")}
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="schließen"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-page hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
