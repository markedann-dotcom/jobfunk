"use client";

import Link from "next/link";
import { ARTICLES, pick } from "@/lib/articles";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/reveal";
import { ArticleIcon, colorVar } from "@/components/article-icon";

export function WikiIndex() {
  const { t, lang } = useT();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("wiki.kicker")}
          </span>
          <h1
            className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("wiki.title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t("wiki.sub")}
          </p>
        </div>
      </Reveal>

      {/* Grid */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a, i) => {
          const { cc, soft } = colorVar(a.color);
          return (
            <Reveal key={a.slug} delay={i * 60}>
              <Link
                href={`/ratgeber/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface/85 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ ["--cc" as string]: cc }}
              >
                {/* Cover */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span
                    className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-surface/90 shadow-sm backdrop-blur-sm"
                    style={{ color: cc }}
                  >
                    <ArticleIcon name={a.icon} className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                <h2
                  className="text-lg font-extrabold leading-snug text-ink transition group-hover:text-[var(--cc)]"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {pick(a.title, lang)}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {pick(a.excerpt, lang)}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                  <span className="text-xs font-semibold text-muted">
                    {a.minutes} {t("wiki.minutes")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--cc)]">
                    {t("wiki.readmore")}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted">{t("wiki.note")}</p>
    </div>
  );
}
