"use client";

import Link from "next/link";
import { type Article, ARTICLES, pick } from "@/lib/articles";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/reveal";
import { ArticleIcon, colorVar } from "@/components/article-icon";

export function WikiArticle({ article }: { article: Article }) {
  const { t, lang } = useT();
  const { cc, soft } = colorVar(article.color);
  const more = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      style={{ ["--cc" as string]: cc }}
    >
      <Link
        href="/ratgeber"
        className="mb-7 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← {t("wiki.back")}
      </Link>

      {/* Cover */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover}
          alt=""
          className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
        />
        <span
          className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl bg-surface/90 shadow-sm backdrop-blur-sm"
          style={{ color: cc }}
        >
          <ArticleIcon name={article.icon} className="h-6 w-6" />
        </span>
      </div>

      {/* Header */}
      <div className="mt-7">
        <span className="text-xs font-semibold text-muted">
          {article.minutes} {t("wiki.minutes")}
        </span>
        <h1
          className="mt-1.5 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {pick(article.title, lang)}
        </h1>
      </div>

      <p className="mt-4 text-lg leading-relaxed text-muted">
        {pick(article.excerpt, lang)}
      </p>

      <div className="my-8 h-px w-full bg-border" />

      {/* Body */}
      <article className="space-y-6">
        {article.body.map((b, i) => {
          if (b.type === "h2") {
            return (
              <h2
                key={i}
                className="pt-2 text-xl font-extrabold text-ink sm:text-2xl"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {pick({ de: b.de, uk: b.uk }, lang)}
              </h2>
            );
          }
          if (b.type === "p") {
            return (
              <p key={i} className="text-base leading-relaxed text-ink/80">
                {pick({ de: b.de, uk: b.uk }, lang)}
              </p>
            );
          }
          if (b.type === "ul") {
            const items = pick({ de: b.de, uk: b.uk }, lang);
            return (
              <ul key={i} className="space-y-2.5">
                {items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-base leading-relaxed text-ink/80">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: cc }}
                    />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            );
          }
          // tip
          return (
            <div
              key={i}
              className="flex gap-3 rounded-2xl border border-border p-4"
              style={{ background: soft }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
                style={{ color: cc }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
              </svg>
              <p className="text-sm font-medium leading-relaxed text-ink">
                {pick({ de: b.de, uk: b.uk }, lang)}
              </p>
            </div>
          );
        })}
      </article>

      {/* CTA */}
      <Reveal className="mt-12">
        <div className="rounded-3xl border border-border bg-surface/70 p-7 text-center backdrop-blur-md">
          <h3
            className="text-xl font-extrabold text-ink"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("wiki.cta.title")}
          </h3>
          <p className="mt-1.5 text-sm text-muted">{t("wiki.cta.sub")}</p>
          <Link
            href="/suche"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-strong"
          >
            {t("wiki.cta.btn")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Reveal>

      {/* More articles */}
      <div className="mt-14">
        <h3
          className="text-lg font-extrabold text-ink"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {t("wiki.more.title")}
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {more.map((a) => {
            const c = colorVar(a.color);
            return (
              <Link
                key={a.slug}
                href={`/ratgeber/${a.slug}`}
                className="group rounded-2xl border border-border bg-surface/85 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: c.soft, color: c.cc }}
                >
                  <ArticleIcon name={a.icon} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold leading-snug text-ink transition group-hover:text-accent">
                  {pick(a.title, lang)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
