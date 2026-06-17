// Saved searches — stored locally. Lets a user re-run a query in one tap.

export interface SavedSearch {
  id: string;
  was?: string;
  wo?: string;
  umkreis?: string;
  angebotsart?: string;
  arbeitszeit?: string;
  veroeffentlichtseit?: string;
  befristung?: string;
  sort?: string;
  createdAt: number;
}

const KEY = "jf_saved_searches";
const MAX = 30;

function read(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((s) => s && typeof s.id === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: SavedSearch[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event("jf:saved-search"));
  } catch {
    /* ignore */
  }
}

// Build a stable signature so the same query isn't saved twice.
function signature(s: Omit<SavedSearch, "id" | "createdAt">): string {
  return [
    s.was ?? "",
    s.wo ?? "",
    s.umkreis ?? "",
    s.angebotsart ?? "",
    s.arbeitszeit ?? "",
    s.veroeffentlichtseit ?? "",
    s.befristung ?? "",
    s.sort ?? "",
  ]
    .join("|")
    .toLowerCase();
}

export function getSavedSearches(): SavedSearch[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function isSearchSaved(s: Omit<SavedSearch, "id" | "createdAt">): boolean {
  const sig = signature(s);
  return read().some((x) => signature(x) === sig);
}

export function saveSearch(s: Omit<SavedSearch, "id" | "createdAt">): boolean {
  const sig = signature(s);
  const list = read();
  if (list.some((x) => signature(x) === sig)) return false; // already saved
  list.unshift({ ...s, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() });
  write(list);
  return true;
}

export function removeSearchBySignature(s: Omit<SavedSearch, "id" | "createdAt">) {
  const sig = signature(s);
  write(read().filter((x) => signature(x) !== sig));
}

export function removeSearch(id: string) {
  write(read().filter((x) => x.id !== id));
}

// Turn a saved search into a /suche querystring.
export function searchToQuery(s: Partial<SavedSearch>): string {
  const q = new URLSearchParams();
  if (s.was) q.set("was", s.was);
  if (s.wo) q.set("wo", s.wo);
  if (s.umkreis) q.set("umkreis", s.umkreis);
  if (s.angebotsart) q.set("angebotsart", s.angebotsart);
  if (s.arbeitszeit) q.set("arbeitszeit", s.arbeitszeit);
  if (s.veroeffentlichtseit) q.set("veroeffentlichtseit", s.veroeffentlichtseit);
  if (s.befristung) q.set("befristung", s.befristung);
  if (s.sort) q.set("sort", s.sort);
  q.set("page", "1");
  return q.toString();
}
