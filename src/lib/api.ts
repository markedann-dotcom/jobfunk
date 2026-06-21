// Server-side client for the Bundesagentur für Arbeit Jobsuche API & Arbeitnow.
// All calls go through Next.js route handlers (never the browser directly).

const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4";
const API_KEY = "jobboerse-jobsuche";

// ---- Types -----------------------------------------------------------------

export type Angebotsart = "" | "1" | "2" | "4" | "34";

export interface SearchParams {
  was?: string;
  wo?: string;
  umkreis?: string;
  angebotsart?: Angebotsart;
  arbeitszeit?: string;
  veroeffentlichtseit?: string;
  befristung?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface JobListItem {
  refnr: string;
  titel: string;
  beruf?: string;
  arbeitgeber?: string;
  ort?: string;
  plz?: string;
  region?: string;
  published?: string;
  externeUrl?: string | null;
  angebotsart?: string;
  entfernung?: string | null;
  lat?: number | null;
  lon?: number | null;
}

export interface SearchResult {
  jobs: JobListItem[];
  total: number;
  page: number;
  size: number;
}

export interface JobDetail {
  refnr: string;
  titel: string;
  beruf?: string;
  arbeitgeber?: string;
  ort?: string;
  plz?: string;
  region?: string;
  strasse?: string;
  published?: string;
  eintrittsdatum?: string;
  beschreibung?: string;
  externeUrl?: string | null;
  arbeitszeit?: string;
  verguetung?: string;
  branche?: string;
}

export interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

// ---- Simple in-memory cache ------------------------------------------------

interface CacheEntry {
  value: unknown;
  expires: number;
}
const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000; // 5 minutes

function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}
function cacheSet(key: string, value: unknown) {
  if (cache.size > 500) cache.clear();
  cache.set(key, { value, expires: Date.now() + TTL });
}

async function fetchApi(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json();
}

// ---- Beruf (occupation) suggestions ----------------------------------------

export async function suggestBerufe(was: string, limit = 8): Promise<{ label: string; count: number }[]> {
  const q = was.trim();
  if (q.length < 2) return [];

  const key = `suggest:${q.toLowerCase()}`;
  const cached = cacheGet<{ label: string; count: number }[]>(key);
  if (cached) return cached;

  const qs = new URLSearchParams({ was: q, size: "1", facetten: "beruf" });

  let counts: Record<string, number> = {};
  try {
    const data = (await fetchApi(`${BASE}/jobs?${qs.toString()}`)) as {
      facetten?: { beruf?: { counts?: Record<string, number> } };
    };
    counts = data.facetten?.beruf?.counts ?? {};
  } catch {
    return [];
  }

  const lower = q.toLowerCase();
  const out = Object.entries(counts)
    .map(([label, count]) => ({ label, count: Number(count) || 0 }))
    .sort((a, b) => {
      const am = a.label.toLowerCase().includes(lower) ? 0 : 1;
      const bm = b.label.toLowerCase().includes(lower) ? 0 : 1;
      if (am !== bm) return am - bm;
      return b.count - a.count;
    })
    .slice(0, limit);

  cacheSet(key, out);
  return out;
}

// ---- Normalizers -----------------------------------------------------------

interface RawArbeitsort {
  ort?: string;
  plz?: string;
  region?: string;
  strasse?: string;
  entfernung?: string;
  koordinaten?: { lat?: number; lon?: number };
}
interface RawListItem {
  refnr?: string;
  titel?: string;
  beruf?: string;
  arbeitgeber?: string;
  arbeitsort?: RawArbeitsort;
  aktuelleVeroeffentlichungsdatum?: string;
  externeUrl?: string;
  angebotsart?: string;
}

function normalizeList(raw: RawListItem): JobListItem {
  const ao = raw.arbeitsort ?? {};
  return {
    refnr: raw.refnr ?? "",
    titel: raw.titel ?? raw.beruf ?? "—",
    beruf: raw.beruf,
    arbeitgeber: raw.arbeitgeber,
    ort: ao.ort,
    plz: ao.plz,
    region: ao.region,
    published: raw.aktuelleVeroeffentlichungsdatum,
    externeUrl: raw.externeUrl ?? null,
    angebotsart: raw.angebotsart,
    entfernung: ao.entfernung ?? null,
    lat: ao.koordinaten?.lat ?? null,
    lon: ao.koordinaten?.lon ?? null,
  };
}

// ---- Arbeitnow Fetcher -----------------------------------------------------

async function fetchArbeitnowJobs(p: SearchParams): Promise<JobListItem[]> {
  try {
    const page = p.page ?? 1;
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    let jobs: ArbeitnowJob[] = data.data || [];

    if (p.was) {
      const q = p.was.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company_name.toLowerCase().includes(q)
      );
    }
    if (p.wo) {
      const loc = p.wo.toLowerCase();
      jobs = jobs.filter(j => 
        j.location.toLowerCase().includes(loc) || 
        (loc === "remote" && j.remote)
      );
    }

    return jobs.map(job => {
      const refnr = `arbeitnow-${job.slug}`;
      const published = new Date(job.created_at * 1000).toISOString().split('T')[0];
      const ort = job.remote ? `${job.location} (Remote)` : job.location;

      // 💥 МАГИЯ ЗДЕСЬ: Мы сразу кладем полные детали в кэш
      const detail: JobDetail = {
        refnr,
        titel: job.title,
        beruf: job.tags?.join(", ") || undefined,
        arbeitgeber: job.company_name,
        ort,
        published,
        beschreibung: job.description, // Полное HTML описание от Arbeitnow
        externeUrl: job.url,
        arbeitszeit: job.job_types?.join(", ") || undefined,
      };
      cacheSet(`detail:${refnr}`, detail);

      return {
        refnr,
        titel: job.title,
        beruf: job.tags?.join(", "),
        arbeitgeber: job.company_name,
        ort,
        plz: undefined,
        region: undefined,
        published,
        externeUrl: job.url,
        angebotsart: "Arbeitnow",
        entfernung: null,
        lat: null,
        lon: null,
      };
    });
  } catch (error) {
    console.error("Ошибка при загрузке Arbeitnow:", error);
    return [];
  }
}

// ---- Search ----------------------------------------------------------------

export async function searchJobs(p: SearchParams): Promise<SearchResult> {
  const size = Math.min(p.size ?? 25, 100);
  const page = p.page ?? 1;

  const qs = new URLSearchParams();
  if (p.was) qs.set("was", p.was);
  if (p.wo) qs.set("wo", p.wo);
  if (p.umkreis && p.umkreis !== "0") qs.set("umkreis", p.umkreis);
  if (p.angebotsart) qs.set("angebotsart", p.angebotsart);
  if (p.arbeitszeit) qs.set("arbeitszeit", p.arbeitszeit);
  if (p.veroeffentlichtseit && p.veroeffentlichtseit !== "0")
    qs.set("veroeffentlichtseit", p.veroeffentlichtseit);
  if (p.befristung) qs.set("befristung", p.befristung);
  if (p.sort) qs.set("sort", p.sort);
  qs.set("page", String(page));
  qs.set("size", String(size));

  const key = `search:${qs.toString()}`;
  const cached = cacheGet<SearchResult>(key);
  if (cached) return cached;

  const [bundesRes, arbeitnowJobs] = await Promise.all([
    fetchApi(`${BASE}/jobs?${qs.toString()}`)
      .catch((e) => {
        console.error("Bundesagentur API error:", e);
        return { stellenangebote: [], maxErgebnisse: 0 };
      }) as Promise<{ stellenangebote?: RawListItem[]; maxErgebnisse?: number; }>,
    
    // Only fetch arbeitnow on page 1 to avoid duplicating the same jobs every page
    page === 1 ? fetchArbeitnowJobs(p) : Promise.resolve([] as JobListItem[])
  ]);

  const bundesJobs = (bundesRes.stellenangebote ?? []).map(normalizeList);
  const combinedJobs = [...bundesJobs, ...arbeitnowJobs];

  const result: SearchResult = {
    jobs: combinedJobs,
    total: bundesRes.maxErgebnisse ?? 0,
    page,
    size,
  };
  
  cacheSet(key, result);
  return result;
}

// ---- Detail ----------------------------------------------------------------

interface RawLokationAdresse {
  plz?: string;
  ort?: string;
  region?: string;
  strasse?: string;
  land?: string;
}
interface RawLokation {
  adresse?: RawLokationAdresse;
}
interface RawDetail {
  referenznummer?: string;
  stellenangebotsTitel?: string;
  hauptberuf?: string;
  firma?: string;
  stellenangebotsBeschreibung?: string;
  stellenlokationen?: RawLokation[];
  datumErsteVeroeffentlichung?: string;
  eintrittszeitraum?: { von?: string; bis?: string };
  verguetungsangabe?: string;
  artDerVerguetung?: string;
  gehaltsspanneVon?: number;
  gehaltsspanneBis?: number;
  arbeitszeitVollzeit?: boolean;
  arbeitszeitTeilzeitFlexibel?: boolean;
  arbeitszeitTeilzeitVormittag?: boolean;
  arbeitszeitTeilzeitNachmittag?: boolean;
  arbeitszeitTeilzeitAbend?: boolean;
  arbeitszeitSchichtNachtWochenende?: boolean;
  homeofficemoeglich?: boolean;
  istGeringfuegigeBeschaeftigung?: boolean;
  stellenangebotsart?: string;
  vertragsdauer?: string;
  allianzpartnerUrl?: string;
}

function buildArbeitszeit(raw: RawDetail): string | undefined {
  const parts: string[] = [];
  if (raw.arbeitszeitVollzeit) parts.push("Vollzeit");
  if (
    raw.arbeitszeitTeilzeitFlexibel ||
    raw.arbeitszeitTeilzeitVormittag ||
    raw.arbeitszeitTeilzeitNachmittag ||
    raw.arbeitszeitTeilzeitAbend
  )
    parts.push("Teilzeit");
  if (raw.arbeitszeitSchichtNachtWochenende) parts.push("Schicht/Nacht/Wochenende");
  if (raw.homeofficemoeglich) parts.push("Homeoffice möglich");
  return parts.length ? parts.join(" · ") : undefined;
}

function buildVerguetung(raw: RawDetail): string | undefined {
  const von = raw.gehaltsspanneVon;
  const bis = raw.gehaltsspanneBis;
  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const unit = raw.verguetungsangabe === "STUNDENLOHN" ? "€/Std." : "€";
  if (von != null && bis != null) {
    if (von === bis) return `${fmt(von)} ${unit}`;
    return `${fmt(von)} – ${fmt(bis)} ${unit}`;
  }
  if (von != null) return `ab ${fmt(von)} ${unit}`;
  return undefined;
}

export async function getJobDetail(refnr: string): Promise<JobDetail> {
  const key = `detail:${refnr}`;
  const cached = cacheGet<JobDetail>(key);
  if (cached) return cached;

  // 💥 Обработка деталей для Arbeitnow, если их нет в кэше
  if (refnr.startsWith('arbeitnow-')) {
    const slug = refnr.replace('arbeitnow-', '');
    
    // Ищем вакансию на 3 последних страницах API
    for (let page = 1; page <= 3; page++) {
      try {
        const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const jobs: ArbeitnowJob[] = data.data || [];
        const job = jobs.find(j => j.slug === slug);
        
        if (job) {
          const detail: JobDetail = {
            refnr,
            titel: job.title,
            beruf: job.tags?.join(", ") || undefined,
            arbeitgeber: job.company_name,
            ort: job.remote ? `${job.location} (Remote)` : job.location,
            published: new Date(job.created_at * 1000).toISOString().split('T')[0],
            beschreibung: job.description,
            externeUrl: job.url,
            arbeitszeit: job.job_types?.join(", ") || undefined,
          };
          cacheSet(key, detail);
          return detail;
        }
      } catch (e) {
        continue;
      }
    }
    throw new Error("Stelle konnte nicht geladen werden (Arbeitnow)");
  }

  // Обычная загрузка деталей для Bundesagentur
  const encoded = Buffer.from(refnr, "utf-8").toString("base64");
  const raw = (await fetchApi(`${BASE}/jobdetails/${encoded}`)) as RawDetail;

  const ad = raw.stellenlokationen?.[0]?.adresse ?? {};
  const region = ad.region
    ? ad.region
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join("-")
    : undefined;

  const detail: JobDetail = {
    refnr: raw.referenznummer ?? refnr,
    titel: raw.stellenangebotsTitel ?? raw.hauptberuf ?? "—",
    beruf: raw.hauptberuf,
    arbeitgeber: raw.firma,
    ort: ad.ort,
    plz: ad.plz,
    region,
    strasse: ad.strasse && ad.strasse !== "null" ? ad.strasse : undefined,
    published: raw.datumErsteVeroeffentlichung,
    eintrittsdatum: raw.eintrittszeitraum?.von,
    beschreibung: raw.stellenangebotsBeschreibung,
    externeUrl: raw.allianzpartnerUrl
      ? raw.allianzpartnerUrl.startsWith("http")
        ? raw.allianzpartnerUrl
        : `https://${raw.allianzpartnerUrl}`
      : null,
    arbeitszeit: buildArbeitszeit(raw),
    verguetung: buildVerguetung(raw),
    branche: raw.istGeringfuegigeBeschaeftigung ? "Minijob" : undefined,
  };
  cacheSet(key, detail);
  return detail;
}

// ---- Similar jobs -----------------------------------------------------------

export async function getSimilarJobs(detail: JobDetail, limit = 4): Promise<JobListItem[]> {
  const was = detail.beruf || detail.titel;
  if (!was) return [];

  const { jobs } = await searchJobs({
    was,
    wo: detail.ort,
    size: limit + 5,
  });

  return jobs.filter((j) => j.refnr !== detail.refnr).slice(0, limit);
}

// External link helper.
export function jobExternalLink(j: { externeUrl?: string | null; refnr: string }): string {
  if (j.externeUrl) return j.externeUrl;
  return `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(j.refnr)}`;
}
