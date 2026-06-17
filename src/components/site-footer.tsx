"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { PwaInstallButton } from "./pwa-install-button";
import { openCookieSettings } from "./cookie-banner";

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border/60 bg-surface">
      <div className="footer-bg" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
                </svg>
              </span>
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Job<span className="text-accent">Funke</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {t("footer.disclaimer")}
            </p>

            {/* PWA install */}
            <div className="mt-5">
              <PwaInstallButton />
              <p className="mt-2 text-xs text-muted">{t("pwa.footer.hint")}</p>
            </div>
          </div>

          {/* nav */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink">
              {t("nav.search")}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted transition hover:text-accent">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/suche" className="text-muted transition hover:text-accent">
                  {t("nav.search")}
                </Link>
              </li>
              <li>
                <Link href="/merkliste" className="text-muted transition hover:text-accent">
                  {t("nav.favorites")}
                </Link>
              </li>
            </ul>
          </div>

          {/* legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink">Rechtliches</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="text-muted transition hover:text-accent">
                  {t("legal.impressum")}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-muted transition hover:text-accent">
                  {t("legal.datenschutz")}
                </Link>
              </li>
              <li>
                <Link href="/haftungsausschluss" className="text-muted transition hover:text-accent">
                  {t("legal.disclaimer")}
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookieSettings}
                  className="text-left text-muted transition hover:text-accent"
                >
                  {t("cookie.settings")}
                </button>
              </li>
              <li>
                <a
                  href="https://www.arbeitsagentur.de/jobsuche/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition hover:text-accent"
                >
                  {t("footer.data")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* independence disclaimer strip */}
        <div className="mt-10 rounded-2xl border border-border bg-page/60 px-4 py-3 text-xs leading-relaxed text-muted">
          {t("footer.independence")}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} JobFunke. {t("footer.rights")}
          </p>
          <p>
            Datenquelle:{" "}
            <a
              href="https://www.arbeitsagentur.de/jobsuche/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Bundesagentur für Arbeit
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
