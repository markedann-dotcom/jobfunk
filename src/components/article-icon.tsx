"use client";

// Icon set used by Ratgeber/Wiki articles. Resolved by Article.icon name.
export function ArticleIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const p = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h6M9 9h1" />
        </svg>
      );
    case "pen":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a8.4 8.4 0 0 1-.9-4A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
          <path d="M9 11h.01M12.5 11h.01M16 11h.01" />
        </svg>
      );
    case "badge":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
        </svg>
      );
    case "lang":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15 9-2 6-4 2 2-6 4-2z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
}

// Maps Article.color -> palette CSS var base (matches globals :root --c-*).
export function colorVar(color: string): { cc: string; soft: string } {
  return { cc: `var(--c-${color})`, soft: `var(--c-${color}-soft)` };
}
