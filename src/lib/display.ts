import type { Lang } from "./i18n";

export function formatDate(iso?: string, lang: Lang = "de"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "uk" ? "uk-UA" : "de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isRecent(iso?: string, days = 7): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() < days * 86400000;
}

// Map angebotsart code → translation key + accent tone.
export function typeMeta(code?: string): { key: string; tone: string } {
  switch (code) {
    case "4":
      return { key: "type.4", tone: "blue" };
    case "34":
      return { key: "type.34", tone: "green" };
    case "2":
      return { key: "type.2", tone: "violet" };
    default:
      return { key: "type.1", tone: "orange" };
  }
}

// Tone → palette CSS variable base name (see globals.css --c-*).
// Used via inline style so colours adapt in light & dark automatically.
export const toneVar: Record<string, string> = {
  orange: "amber",
  blue: "blue",
  green: "green",
  violet: "violet",
};
