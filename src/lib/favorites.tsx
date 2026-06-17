"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { JobListItem } from "./api";

const KEY = "jf_favorites";
const MAX = 200;

export interface FavJob {
  refnr: string;
  titel: string;
  arbeitgeber?: string;
  ort?: string;
  plz?: string;
  region?: string;
  published?: string;
  angebotsart?: string;
  externeUrl?: string | null;
  savedAt: number;
}

function sanitize(j: Partial<FavJob>): FavJob | null {
  if (!j || typeof j.refnr !== "string" || !j.refnr) return null;
  const s = (v: unknown, max = 300) =>
    typeof v === "string" ? v.slice(0, max) : undefined;
  return {
    refnr: j.refnr.slice(0, 120),
    titel: s(j.titel) ?? "—",
    arbeitgeber: s(j.arbeitgeber),
    ort: s(j.ort, 120),
    plz: s(j.plz, 10),
    region: s(j.region, 120),
    published: s(j.published, 30),
    angebotsart: s(j.angebotsart, 5),
    externeUrl: typeof j.externeUrl === "string" ? j.externeUrl.slice(0, 600) : null,
    savedAt: typeof j.savedAt === "number" ? j.savedAt : Date.now(),
  };
}

function load(): FavJob[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(sanitize).filter(Boolean).slice(0, MAX) as FavJob[];
  } catch {
    return [];
  }
}

type Ctx = {
  favorites: FavJob[];
  isFav: (refnr: string) => boolean;
  toggle: (job: JobListItem | FavJob) => void;
  remove: (refnr: string) => void;
  count: number;
};

const FavContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavJob[]>([]);

  useEffect(() => {
    setFavorites(load());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavorites(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: FavJob[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX)));
    } catch {}
  }, []);

  const isFav = useCallback(
    (refnr: string) => favorites.some((f) => f.refnr === refnr),
    [favorites]
  );

  const toggle = useCallback(
    (job: JobListItem | FavJob) => {
      const clean = sanitize({ ...job, savedAt: Date.now() });
      if (!clean) return;
      setFavorites((prev) => {
        const exists = prev.some((f) => f.refnr === clean.refnr);
        const next = exists
          ? prev.filter((f) => f.refnr !== clean.refnr)
          : [clean, ...prev].slice(0, MAX);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (refnr: string) => {
      persist(favorites.filter((f) => f.refnr !== refnr));
    },
    [favorites, persist]
  );

  return (
    <FavContext.Provider
      value={{ favorites, isFav, toggle, remove, count: favorites.length }}
    >
      {children}
    </FavContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
