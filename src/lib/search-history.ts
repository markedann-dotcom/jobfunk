// Lightweight auto search history (last N queries), local-only.
// Distinct from saved-search (explicit) — this records every search automatically.

export interface HistoryEntry {
  was: string;
  wo: string;
  umkreis: string;
  angebotsart: string;
  ts: number;
}

const KEY = "jf_search_history";
const MAX = 10;

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        was: String(e.was ?? "").slice(0, 80),
        wo: String(e.wo ?? "").slice(0, 20),
        umkreis: String(e.umkreis ?? "25").slice(0, 4),
        angebotsart: String(e.angebotsart ?? "").slice(0, 2),
        ts: Number(e.ts) || Date.now(),
      }))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event("jf:search-history"));
  } catch {
    /* ignore */
  }
}

function sig(e: Pick<HistoryEntry, "was" | "wo" | "angebotsart">) {
  return `${e.was.toLowerCase().trim()}|${e.wo.toLowerCase().trim()}|${e.angebotsart}`;
}

export function getHistory(): HistoryEntry[] {
  return read();
}

export function recordHistory(e: Omit<HistoryEntry, "ts">) {
  // skip totally empty searches
  if (!e.was.trim() && !e.wo.trim() && !e.angebotsart) return;
  const entry: HistoryEntry = { ...e, ts: Date.now() };
  const cur = read().filter((x) => sig(x) !== sig(entry));
  write([entry, ...cur]);
}

export function clearHistory() {
  write([]);
}

export function historyToQuery(e: HistoryEntry): string {
  const q = new URLSearchParams();
  if (e.was) q.set("was", e.was);
  if (e.wo) q.set("wo", e.wo);
  q.set("umkreis", e.umkreis || "25");
  if (e.angebotsart) q.set("angebotsart", e.angebotsart);
  q.set("page", "1");
  return q.toString();
}
