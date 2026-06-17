"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Helles Design" : "Dunkles Design"}
      title={isDark ? "Light" : "Dark"}
      className="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-border bg-surface text-muted transition hover:border-accent hover:text-accent"
    >
      <span
        className="relative grid place-items-center transition-transform duration-500"
        style={{ transform: mounted && isDark ? "rotate(0deg)" : "rotate(0deg)" }}
      >
        {/* Sun */}
        <svg
          viewBox="0 0 24 24"
          className={`absolute h-5 w-5 transition-all duration-300 ${
            mounted && isDark
              ? "scale-0 -rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* Moon */}
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition-all duration-300 ${
            mounted && isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
