// Recently viewed jobs — stored locally, never sent anywhere.

export interface RecentJob {
  refnr: string;
  titel: string;
  arbeitgeber?: string;
  ort?: string;
  plz?: string;
  angebotsart?: string;
  viewedAt: number;
}

const KEY = "jf_recent";
const MAX = 12;

function read(): RecentJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((r) => r && typeof r.refnr === "string" && typeof r.titel === "string")
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: RecentJob[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event("jf:recent"));
  } catch {
    /* ignore quota */
  }
}

export function getRecent(): RecentJob[] {
  return read();
}

export function recordRecent(job: Omit<RecentJob, "viewedAt">) {
  if (!job.refnr) return;
  const list = read().filter((r) => r.refnr !== job.refnr);
  list.unshift({
    refnr: job.refnr,
    titel: job.titel,
    arbeitgeber: job.arbeitgeber,
    ort: job.ort,
    plz: job.plz,
    angebotsart: job.angebotsart,
    viewedAt: Date.now(),
  });
  write(list);
}

export function clearRecent() {
  write([]);
}
