"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { SearchForm } from "@/components/search-form";
import { FeaturedJobs } from "@/components/featured-jobs";
import { HomeRecent } from "@/components/home-recent";
import { AdSlot } from "@/components/ad-slot";
import { CategoryTiles } from "@/components/category-tiles";
import { FaqSection } from "@/components/faq-section";
import { Onboarding } from "@/components/onboarding";
import { Reveal } from "@/components/reveal";
import { JobTokPromo } from "@/components/jobtok-promo";

export default function HomePage() {
  const { t } = useT();

  const popular = [
    "Lagerlogistik",
    "Pflegekraft",
    "Verkäufer",
    "Elektriker",
    "Fahrer",
    "Reinigungskraft",
    "Koch",
    "Maler",
  ];

  return (
    <>
      {/* Hero — themed illustration banner + soft center fade for readability */}
      <section className="relative overflow-hidden">
        <div className="hero-art" aria-hidden />
        <div className="hero-art-fade" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="fade-up d1 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs font-semibold text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("hero.kicker")}
            </span>

            <h1
              className="fade-up d2 mt-5 text-balance text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {t("hero.title.1")}{" "}
              <span className="relative whitespace-nowrap text-accent">
                {t("hero.title.2")}
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent/40"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path d="M2 8c40-6 120-6 196 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="fade-up d3 mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {t("hero.sub")}
            </p>
          </div>

          <div className="fade-up d4 mx-auto mt-9 max-w-4xl">
            <SearchForm variant="hero" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted">·</span>
              {popular.map((p) => (
                <Link
                  key={p}
                  href={`/suche?was=${encodeURIComponent(p)}&umkreis=25&page=1`}
                  className="rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recently viewed + saved searches (local, only shown if any) */}
      <Reveal as="div">
        <HomeRecent />
      </Reveal>

      {/* Category tiles */}
      <Reveal as="div">
        <CategoryTiles />
      </Reveal>

      {/* Featured jobs — so the homepage is never empty */}
      <Reveal as="div" className="pt-6">
        <FeaturedJobs />
      </Reveal>

      {/* Advertising slot */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <AdSlot variant="banner" />
      </Reveal>

      {/* Features */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: <FreeIcon />, t: t("feat.1.t"), d: t("feat.1.d"), c: "amber" },
            { icon: <CheckIcon />, t: t("feat.2.t"), d: t("feat.2.d"), c: "teal" },
            { icon: <HeartIcon />, t: t("feat.3.t"), d: t("feat.3.d"), c: "coral" },
          ].map((f, i) => (
            <div
              key={i}
              style={{ ["--cc" as string]: `var(--c-${f.c})`, ["--cc-soft" as string]: `var(--c-${f.c}-soft)` }}
              className="rounded-2xl border border-border bg-surface/85 p-6 shadow-[0_2px_10px_-4px_rgba(60,40,20,0.06)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(120,72,20,0.22)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--cc-soft)", color: "var(--cc)" }}>
                {f.icon}
              </div>
              <h3
                className="mt-4 text-lg font-bold text-ink"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {f.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* JobTok promo */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <JobTokPromo />
      </Reveal>

      {/* FAQ */}
      <Reveal as="div">
        <FaqSection />
      </Reveal>

      {/* CTA — same seamless canvas, soft glass card, no hard block */}
      <Reveal as="section" className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface/70 px-6 py-16 text-center shadow-[0_20px_60px_-30px_rgba(120,72,20,0.30)] backdrop-blur-md sm:px-10 sm:py-20">
          <div className="hero-mesh absolute inset-0 opacity-70" aria-hidden />
          <div className="relative">
            <h2
              className="text-balance text-3xl font-black text-ink sm:text-4xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">{t("cta.sub")}</p>
            <Link
              href="/suche"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-8 text-[15px] font-bold text-white transition hover:bg-accent-strong active:scale-[0.98]"
            >
              {t("cta.btn")}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* First-visit onboarding (dismissable) */}
      <Onboarding />
    </>
  );
}

function FreeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3 4c-.7.4-.9.9-.9 1.5M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3 7-7M21 12a9 9 0 1 1-3-6.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
