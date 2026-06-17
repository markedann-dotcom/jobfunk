"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";

const ITEMS = [
  { href: "/", key: "mnav.home", icon: "home" },
  { href: "/suche", key: "mnav.search", icon: "search" },
  { href: "/merkliste", key: "mnav.fav", icon: "heart" },
  { href: "/netto-rechner", key: "mnav.netto", icon: "calc" },
] as const;

export function MobileNav() {
  const { t } = useT();
  const pathname = usePathname();
  const { count: favCount } = useFavorites();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span className="relative">
                  <Icon name={it.icon} active={active} />
                  {it.icon === "heart" && favCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-black text-white">
                      {favCount > 99 ? "99" : favCount}
                    </span>
                  )}
                </span>
                {t(it.key)}
                {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-accent" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Icon({ name, active }: { name: string; active: boolean }) {
  const cls = "h-5 w-5";
  const p = {
    fill: active ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>;
    case "search":
      return <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>;
    case "heart":
      return <svg viewBox="0 0 24 24" className={cls} {...p}><path d="M12 20s-7-4.5-9.2-8.4A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.6C19 15.5 12 20 12 20z" /></svg>;
    case "calc":
      return <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15v3" /></svg>;
    default:
      return null;
  }
}
