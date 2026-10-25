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
import { useAuth } from "./auth";
import { supabaseClient } from "./supabase";

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
  syncError: string;
};

const FavContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavJob[]>([]);
  const [syncError, setSyncError] = useState("");
  const { user, ready } = useAuth();

  useEffect(() => {
    setFavorites(load());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavorites(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const client = supabaseClient();
    if (!user || !client) { setFavorites(load()); return; }
    let active = true;
    (async () => {
      const { data, error } = await client.from("saved_jobs")
        .select("job").eq("user_id", user.id).order("saved_at", { ascending: false }).limit(MAX);
      if (!active) return;
      if (error) { setSyncError("Merkliste konnte nicht synchronisiert werden."); return; }
      const remote = (data || []).map((row) => sanitize(row.job as FavJob)).filter(Boolean) as FavJob[];
      const guest = load();
      const missing = guest.filter((j) => !remote.some((r) => r.refnr === j.refnr));
      if (missing.length) {
        const result = await client.from("saved_jobs").upsert(
          missing.map((job) => ({ user_id: user.id, refnr: job.refnr, job, saved_at: new Date(job.savedAt).toISOString() })),
          { onConflict: "user_id,refnr" }
        );
        if (!active) return;
        if (result.error) { setSyncError("Lokale Favoriten konnten nicht übertragen werden."); return; }
      }
      try { localStorage.removeItem(KEY); } catch {}
      setSyncError("");
      setFavorites([...missing, ...remote].slice(0, MAX));
    })();
    return () => { active = false; };
  }, [user?.id, ready]);

  const persist = useCallback((next: FavJob[]) => {
    setFavorites(next);
    if (!user) {
      try { localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX))); } catch {}
    }
  }, [user]);

  const cloudWrite = useCallback(async (job: FavJob, add: boolean) => {
    if (!user) return;
    const client = supabaseClient();
    if (!client) return;
    const result = add
      ? await client.from("saved_jobs").upsert({ user_id: user.id, refnr: job.refnr, job }, { onConflict: "user_id,refnr" })
      : await client.from("saved_jobs").delete().eq("user_id", user.id).eq("refnr", job.refnr);
    if (result.error) setSyncError("Änderung konnte nicht gespeichert werden. Bitte Seite neu laden.");
    else setSyncError("");
  }, [user]);

  const isFav = useCallback(
    (refnr: string) => favorites.some((f) => f.refnr === refnr),
    [favorites]
  );

  const toggle = useCallback(
    (job: JobListItem | FavJob) => {
      const clean = sanitize({ ...job, savedAt: Date.now() });
      if (!clean) return;
      const exists = favorites.some((f) => f.refnr === clean.refnr);
      const next = exists
        ? favorites.filter((f) => f.refnr !== clean.refnr)
        : [clean, ...favorites].slice(0, MAX);
      persist(next);
      if (user) void cloudWrite(clean, !exists);
    },
    [user, cloudWrite, favorites, persist]
  );

  const remove = useCallback(
    (refnr: string) => {
      const job = favorites.find((f) => f.refnr === refnr);
      if (job) void cloudWrite(job, false);
      persist(favorites.filter((f) => f.refnr !== refnr));
    },
    [favorites, persist, cloudWrite]
  );

  return (
    <FavContext.Provider
      value={{ favorites, isFav, toggle, remove, count: favorites.length, syncError }}
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
