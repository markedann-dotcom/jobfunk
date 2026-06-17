"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

function buildUrl(refnr: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/job/${encodeURIComponent(refnr)}`;
  }
  return `https://jobfunke.de/job/${encodeURIComponent(refnr)}`;
}

export function ShareMenu({
  refnr,
  title,
  company,
  align = "right",
  drop = "down",
}: {
  refnr: string;
  title: string;
  company?: string;
  align?: "left" | "right";
  drop?: "up" | "down";
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const url = buildUrl(refnr);
  const text = `${title}${company ? ` — ${company}` : ""}`;
  const e = encodeURIComponent;

  const links = [
    {
      key: "WhatsApp",
      href: `https://wa.me/?text=${e(`${text}\n${url}`)}`,
      color: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z" />
        </svg>
      ),
    },
    {
      key: "Telegram",
      href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}`,
      color: "#229ED9",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6.4 13.6l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z" />
        </svg>
      ),
    },
    {
      key: "X",
      href: `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`,
      color: "#0f1419",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M18.2 2H21l-6.4 7.3L22 22h-6.2l-4.9-6.4L5.3 22H2.5l6.9-7.9L2 2h6.3l4.4 5.8L18.2 2zm-1 18h1.6L7.5 3.7H5.8L17.2 20z" />
        </svg>
      ),
    },
    {
      key: "Email",
      href: `mailto:?subject=${e(text)}&body=${e(`${text}\n\n${url}`)}`,
      color: "#EA580C",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {}
    }
    setOpen((o) => !o);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={nativeShare}
        aria-label={t("share.label")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-accent hover:text-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-30 w-56 rounded-2xl border border-border bg-surface p-2 shadow-[0_20px_50px_-15px_rgba(60,40,20,0.3)] ${
            align === "right" ? "right-0" : "left-0"
          } ${drop === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            {t("share.label")}
          </p>
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink transition hover:bg-page"
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-white"
                style={{ backgroundColor: l.color }}
              >
                {l.icon}
              </span>
              {l.key}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink transition hover:bg-page"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="m5 12 5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
                </svg>
              )}
            </span>
            {copied ? t("share.copied") : t("share.copy")}
          </button>
        </div>
      )}
    </div>
  );
}
