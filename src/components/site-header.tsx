"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { LangSwitch } from "./lang-switch";
import { ThemeToggle } from "./theme-toggle";

function Spark() {
  return (
    <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const { t } = useT();
  const { count } = useFavorites();
  const pathname = usePathname();

  // Количество вакансий (в будущем можно брать из API или контекста)
  const totalJobs = 15432;

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
          active
            ? "bg-accent-soft text-accent-strong"
            : "text-muted hover:bg-accent-soft hover:text-ink"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        
        {/* Группа: Логотип + Бейдж */}
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Spark />
            <span
              className="text-lg font-extrabold tracking-tight text-ink"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Job<span className="text-accent">Funke</span>
            </span>
          </Link>

          {/* Пульсирующий бейдж с количеством вакансий */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-border/50 bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-sm transition-colors hover:border-accent/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span>
              <span className="text-ink">{totalJobs.toLocaleString("ru-RU")}</span> {t("nav.active_jobs") || "Jobs online"}
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLink("/", t("nav.home"))}
          {navLink("/suche", t("nav.search"))}
          {navLink("/netto-rechner", t("mnav.netto"))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/merkliste"
            aria-label={t("nav.favorites")}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-muted transition hover:border-accent hover:text-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
