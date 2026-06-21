"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { LangSwitch } from "./lang-switch";
import { ThemeToggle } from "./theme-toggle";

// ─── Spark logo icon ────────────────────────────────────────────────────────
// Signature element: the bolt gets a live gradient + a quick spin/flare on
// hover. This is the one place the header allows itself to move.

function Spark() {
  return (
    <span className="group/spark relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-strong text-white shadow-[0_2px_10px_-2px_var(--accent)] transition-transform duration-300 ease-out group-hover:scale-105">
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] transition-transform duration-500 ease-out group-hover/spark:rotate-[18deg]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
      </svg>
      {/* flare ring on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-2 ring-accent/40 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </span>
  );
}

// ─── Live-pulse dot ──────────────────────────────────────────────────────────

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

// ─── Favorites icon ──────────────────────────────────────────────────────────

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Hamburger icon ──────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            className="origin-center transition-transform"
          />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  );
}

// ─── SWR fetcher ─────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Nav links config ────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/suche", labelKey: "nav.search" },
  { href: "/ratgeber", labelKey: "nav.wiki" },
  { href: "/jobtok", labelKey: "mnav.jobtok", accent: true },
  { href: "/netto-rechner", labelKey: "mnav.netto" },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function SiteHeader() {
  const { t } = useT();
  const { count } = useFavorites();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data } = useSWR<{ total: number }>("/api/jobs/count", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  const totalJobs = data?.total ?? null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-page/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">

        {/* ── Left: Logo + jobs badge ── */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          >
            <Spark />
            <span
              className="text-[18px] font-extrabold tracking-tight text-ink"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Job<span className="text-accent">Funke</span>
            </span>
          </Link>

          {totalJobs !== null && totalJobs > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-white/40 bg-accent-soft/60 px-2.5 py-1 text-[11px] font-bold text-accent-strong shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-md dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <PulseDot />
              <span>
                {totalJobs.toLocaleString("de-DE")}
                {" Jobs"}
              </span>
            </div>
          )}
        </div>

        {/* ── Center: Desktop nav ── */}
        <nav
          className="hidden sm:flex items-center gap-1"
          aria-label="Hauptnavigation"
        >
          {NAV_LINKS.map(({ href, labelKey, ...rest }) => {
            const active = isActive(href);
            const isAccent = (rest as { accent?: boolean }).accent;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-accent text-white shadow-[0_2px_8px_-2px_var(--accent)]"
                    : isAccent
                    ? "border border-orange-200/80 bg-orange-50/80 text-orange-600 hover:bg-orange-100 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-400"
                    : "text-muted hover:bg-surface hover:text-ink",
                ].join(" ")}
              >
                {t(labelKey)}
                {isAccent && !active && (
                  <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-px text-[9px] font-bold text-white align-middle">NEW</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Favorites */}
          <Link
            href="/merkliste"
            aria-label={`${t("nav.favorites")}${count > 0 ? ` (${count})` : ""}`}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-surface/50 text-muted shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] backdrop-blur-md transition-all duration-200 hover:border-accent/50 hover:bg-accent-soft/40 hover:text-accent hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
          >
            <HeartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-white leading-none ring-2 ring-page">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <ThemeToggle />
          <LangSwitch />

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-surface/50 text-muted shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] backdrop-blur-md transition-all duration-200 hover:border-accent/50 hover:bg-accent-soft/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Menü öffnen"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile Navigation"
          className="sm:hidden border-t border-border/30 bg-page/75 px-4 pb-4 pt-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] backdrop-blur-xl backdrop-saturate-150 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, labelKey }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-accent text-white shadow-[0_2px_8px_-2px_var(--accent)]"
                        : "text-muted hover:bg-surface hover:text-ink",
                    ].join(" ")}
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Jobs badge in mobile menu */}
          {totalJobs !== null && totalJobs > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-full border border-white/40 bg-accent-soft/60 px-3 py-2 text-xs font-bold text-accent-strong shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-md dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <PulseDot />
              <span>
                {totalJobs.toLocaleString("de-DE")}
                {" Jobs aktuell online"}
              </span>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
