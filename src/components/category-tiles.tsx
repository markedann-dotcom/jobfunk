"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";

export function CategoryTiles() {
  const { t, lang } = useT();
  
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-ink sm:text-3xl" style={{ fontFamily: "var(--font-fraunces)" }}>
          {t("cat.title")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("cat.sub")}</p>
      </div>
      
      {/* Сетка: на мобильных 2 колонки, на планшетах 3, на десктопе 4 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {CATEGORIES.map((c) => {
          const label = lang === "uk" ? c.uk : c.de;
          
          return (
            <Link
              key={c.id}
              href={`/suche?was=${encodeURIComponent(c.was)}&umkreis=25&page=1`}
              title={`${label} Jobs suchen`} // Для SEO и доступности
              style={
                {
                  "--cc": `var(--c-${c.color}, #6b7280)`, // #6b7280 (серый) как фолбэк
                } as CSSProperties
              }
              className="group relative block h-36 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_24px_-16px_rgba(120,72,20,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(120,72,20,0.4)] hover:[border-color:color-mix(in_srgb,var(--cc)_60%,transparent)] sm:h-40"
            >
              {/* photo */}
              <img
                src={c.img}
                alt={label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
              />
              
              {/* readability + tint gradient */}
              <span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,15,10,0) 25%, rgba(20,15,10,0.4) 60%, rgba(20,15,10,0.85) 100%)",
                }}
                aria-hidden
              />
              
              {/* color accent bar that grows on hover */}
              <span
                className="absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 bg-(--cc) transition-transform duration-300 ease-out group-hover:scale-x-100"
                style={{ background: "var(--cc)" }}
                aria-hidden
              />
              
              {/* icon chip top-left */}
              <span
                className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white shadow-sm backdrop-blur-md transition group-hover:scale-105 sm:left-4 sm:top-4"
                style={{ background: "color-mix(in srgb, var(--cc) 85%, rgba(0,0,0,0.2))" }}
                aria-hidden
              >
                <CatIcon name={c.icon} />
              </span>
              
              {/* label bottom */}
              <span className="absolute inset-x-3 bottom-3 text-[14px] font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:inset-x-4 sm:bottom-4 sm:text-[15px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CatIcon({ name }: { name: string }) {
  const cls = "h-4 w-4";
  const p = { 
    fill: "none" as const, 
    stroke: "currentColor", 
    strokeWidth: 2, 
    strokeLinecap: "round" as const, 
    strokeLinejoin: "round" as const 
  };
  
  switch (name) {
    case "health":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M12 21s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 21 12 21z" /><path d="M12 9v4M10 11h4" /></svg>;
    case "code":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="m8 9-3 3 3 3M16 9l3 3-3 3M13 6l-2 12" /></svg>;
    case "tools":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M14.7 6.3a4 4 0 0 0 5 5l-7 7a2 2 0 0 1-3-3l7-7-2-2z" /><path d="m3 21 6-6" /></svg>;
    case "food":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9" /></svg>;
    case "box":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="m21 8-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" /></svg>;
    case "cart":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 7H6" /></svg>;
    case "desk":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M3 20h18M8 16v4M16 16v4" /></svg>;
    case "helmet":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M4 14a8 8 0 0 1 16 0M2 14h20v3H2zM9 6v4M15 6v4" /></svg>;
    case "spray":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M8 8h6v13H8zM8 8V4h4M16 4h.01M19 6h.01M17 9h.01" /></svg>;
    case "truck":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></svg>;
    case "gear":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" /></svg>;
    case "people":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" className={cls} {...p}><circle cx="12" cy="12" r="9" /></svg>;
  }
}
