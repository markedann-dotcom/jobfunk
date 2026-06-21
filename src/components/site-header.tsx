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

function Spark() {
  return (
    <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
      </svg>
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
          <line x1="18" y1="6" x2="6" y2="18" />
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-page/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">

        {/* ── Left: Logo + jobs badge ── */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          >
            <Spark />
            <span
              className="text-[17px] font-extrabold tracking-tight text-ink"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Job<span className="text-accent">Funke</span>
            </span>
          </Link>

          {totalJobs !== null && totalJobs > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/50 bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted shadow-sm">
              <PulseDot />
              <span>
                <span className="text-ink">{totalJobs.toLocaleString("de-DE")}</span>
                {" Jobs"}
              </span>
            </div>
          )}
        </div>

        {/* ── Center: Desktop nav ── */}
        <nav
          className="hidden sm:flex items-center gap-0.5"
          aria-label="Hauptnavigation"
        >
          {NAV_LINKS.map(({ href, labelKey }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150",
                  active
                    ? "text-accent"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {t(labelKey)}
                {/* Active underline bar */}
                {active && (
                  <span
                    className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
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
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <HeartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-white leading-none">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <ThemeToggle />
          <LangSwitch />

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          className="sm:hidden border-t border-border/60 bg-page/95 backdrop-blur-md px-4 pb-4 pt-2"
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
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent-soft text-accent-strong"
                        : "text-muted hover:bg-surface hover:text-ink",
                    ].join(" ")}
                  >
                    {active && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-accent shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Jobs badge in mobile menu */}
          {totalJobs !== null && totalJobs > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/50 bg-surface px-3 py-2 text-xs font-semibold text-muted">
              <PulseDot />
              <span>
                <span className="text-ink">{totalJobs.toLocaleString("de-DE")}</span>
                {" Jobs aktuell online"}
              </span>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
