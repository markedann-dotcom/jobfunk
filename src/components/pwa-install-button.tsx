"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { usePwa } from "@/lib/pwa";

/** Compact "Install app" button for the footer — always gives clear feedback. */
export function PwaInstallButton() {
  const { t } = useT();
  const { canInstall, installed, isIos, platform, promptInstall } = usePwa();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close manual-instructions popover on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (installed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-page px-3.5 py-2 text-sm font-semibold text-muted">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("pwa.installed")}
      </span>
    );
  }

  const click = async () => {
    // Native prompt available → use it directly
    if (canInstall) {
      const res = await promptInstall();
      if (res === "unavailable") setOpen(true); // fallback to manual hint
      return;
    }
    // No native prompt (iOS, or Android/desktop before the event) → show how-to
    setOpen((v) => !v);
  };

  const howto =
    isIos || platform === "ios"
      ? t("pwa.ios")
      : platform === "android"
        ? t("pwa.android")
        : t("pwa.desktop");

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        onClick={click}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-accent-strong active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("pwa.footer.cta")}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-border bg-surface p-3.5 text-left shadow-[0_12px_40px_-12px_rgba(20,17,15,0.4)]">
          <p className="mb-1 text-xs font-bold text-ink">{t("pwa.howto")}</p>
          <p className="text-xs leading-relaxed text-muted">{howto}</p>
          <button
            onClick={() => setOpen(false)}
            className="mt-2.5 rounded-full bg-page px-3 py-1 text-[11px] font-semibold text-muted transition hover:text-ink"
          >
            {t("pwa.later")}
          </button>
        </div>
      )}
    </div>
  );
}
