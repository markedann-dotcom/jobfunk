// Unified server-side adapters for free public job feeds.
export type Angebotsart = "" | "1" | "2" | "4" | "34";
export type JobSource = "Arbeitnow" | "Jobicy" | "Remotive" | "Himalayas" | "Nomado24";
export interface SearchParams {
  was?: string; wo?: string; umkreis?: string; angebotsart?: Angebotsart;
  arbeitszeit?: string; veroeffentlichtseit?: string; befristung?: string;
  sort?: string; page?: number; size?: number;
}
export interface JobListItem {
  refnr: string; titel: string; beruf?: string; arbeitgeber?: string;
  ort?: string; plz?: string; region?: string; published?: string;
  externeUrl?: string | null; angebotsart?: string; entfernung?: string | null;
  lat?: number | null; lon?: number | null; source?: JobSource; remote?: boolean;
}
export interface SearchResult {
  jobs: JobListItem[]; total: number; page: number; size: number;
  partial?: boolean; unavailable?: JobSource[];
}
export interface JobDetail extends JobListItem {
  strasse?: string; eintrittsdatum?: string; beschreibung?: string;
  arbeitszeit?: string; verguetung?: string; branche?: string;
}
type Pair = { summary: JobListItem; detail: JobDetail };
type Arbeitnow = { slug?: string; title?: string; company_name?: string; location?: string;
  remote?: boolean; url?: string; description?: string; job_types?: string[]; created_at?: number };
type Jobicy = { id?: number; url?: string; jobTitle?: string; companyName?: string;
  jobGeo?: string; jobType?: string[]; jobDescription?: string; jobExcerpt?: string;
  pubDate?: string; salaryMin?: number; salaryMax?: number; salaryCurrency?: string; salaryPeriod?: string };
type Remotive = { id?: number; url?: string; title?: string; company_name?: string;
  candidate_required_location?: string; job_type?: string; description?: string;
  publication_date?: string; salary?: string };
type Himalayas = { guid?: string; title?: string; companyName?: string; excerpt?: string;
  description?: string; applicationLink?: string; pubDate?: number; expiryDate?: number;
  locationRestrictions?: { alpha2?: string; name?: string }[]; employmentType?: string;
  minSalary?: number; maxSalary?: number; currency?: string; salaryPeriod?: string };
type Nomado = { slug?: string; title?: string; companyName?: string; location?: string;
  remote?: boolean; workArrangement?: string; publishedAt?: string; url?: string;
  tags?: string[]; salaryMin?: number; salaryMax?: number; currency?: string;
  source?: string; description?: string };
type NomadoV2 = { id?: string; canonicalUrl?: string; title?: string;
  company?: { name?: string }; location?: { raw?: string }; workArrangement?: string;
  publishedAt?: string; description?: string; status?: string };

const index = new Map<string, { pair: Pair; expires: number }>();
function remember(pair: Pair): Pair {
  if (index.size > 2500) index.clear();
  index.set(pair.summary.refnr, { pair, expires: Date.now() + 21600000 });
  return pair;
}
const str = (v: unknown, n = 300) => typeof v === "string" ? v.trim().slice(0, n) : "";
export function safeExternalUrl(value?: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function arbeitnowItem(j: Arbeitnow): Pair | null {
  const slug = str(j.slug, 180), url = safeExternalUrl(j.url), title = str(j.title);
  if (!slug || !url || !title || !/^[a-z\d_-]+$/i.test(slug)) return null;
  const kind = (j.job_types || []).join(" ");
  const art = /ausbildung|apprentice|trainee/i.test(title + kind) ? "4" :
    /mini.?job/i.test(title + kind) ? "34" : "1";
  const summary: JobListItem = { refnr: "an-" + slug, titel: title, beruf: title,
    arbeitgeber: str(j.company_name), ort: str(j.location, 120),
    published: j.created_at && Number.isFinite(j.created_at) ? new Date(j.created_at * 1000).toISOString() : undefined,
    externeUrl: url, angebotsart: art, source: "Arbeitnow", remote: j.remote === true };
  return remember({ summary, detail: { ...summary, beschreibung: str(j.description, 30000),
    arbeitszeit: kind || undefined } });
}
function jobicyItem(j: Jobicy): Pair | null {
  const title = str(j.jobTitle), url = safeExternalUrl(j.url);
  if (!Number.isSafeInteger(j.id) || !title || !url || !new URL(url).hostname.endsWith("jobicy.com")) return null;
  const kind = (j.jobType || []).join(" ");
  const summary: JobListItem = { refnr: "jy-" + j.id, titel: title, beruf: title,
    arbeitgeber: str(j.companyName), ort: str(j.jobGeo, 120) || "Remote",
    published: str(j.pubDate, 40), externeUrl: url, source: "Jobicy", remote: true,
    angebotsart: /intern|apprentice|trainee/i.test(title + kind) ? "4" : "1" };
  const salary = j.salaryCurrency === "EUR" && j.salaryMin
    ? j.salaryMin.toLocaleString("de-DE") + (j.salaryMax ? "–" + j.salaryMax.toLocaleString("de-DE") : "+") + " €/" + (str(j.salaryPeriod) || "Jahr")
    : undefined;
  return remember({ summary, detail: { ...summary, beschreibung: str(j.jobDescription || j.jobExcerpt, 30000),
    arbeitszeit: kind || undefined, verguetung: salary } });
}
function remotiveItem(j: Remotive): Pair | null {
  const title = str(j.title), url = safeExternalUrl(j.url);
  if (!Number.isSafeInteger(j.id) || !title || !url || !new URL(url).hostname.endsWith("remotive.com")) return null;
  const summary: JobListItem = { refnr: "rm-" + j.id, titel: title, beruf: title,
    arbeitgeber: str(j.company_name), ort: str(j.candidate_required_location, 120) || "Remote",
    published: str(j.publication_date, 40), externeUrl: url, source: "Remotive", remote: true,
    angebotsart: /intern|apprentice|trainee/i.test(title) ? "4" : "1" };
  return remember({ summary, detail: { ...summary, beschreibung: str(j.description, 30000),
    arbeitszeit: str(j.job_type), verguetung: str(j.salary) } });
}
function himalayasItem(j: Himalayas): Pair | null {
  const url = safeExternalUrl(j.applicationLink), title = str(j.title);
  const id = str(j.guid, 600);
  if (!id || !url || !title || (j.expiryDate && j.expiryDate * 1000 < Date.now())) return null;
  // Stable opaque hash avoids exposing arbitrary upstream URL characters in route paths.
  const refnr = "hm-" + stableHash(id);
  const regions = (j.locationRestrictions || []).map(x => str(x.name, 60));
  const summary: JobListItem = { refnr, titel: title, beruf: title,
    arbeitgeber: str(j.companyName), ort: regions.join(", ") || "Worldwide Remote",
    published: j.pubDate ? new Date(j.pubDate * 1000).toISOString() : undefined,
    externeUrl: url, source: "Himalayas", remote: true,
    angebotsart: /intern|trainee|apprentice/i.test(title) ? "4" : "1" };
  const salary = j.currency && j.minSalary ? `${j.minSalary}–${j.maxSalary || ""} ${j.currency} / ${j.salaryPeriod || "year"}` : undefined;
  return remember({ summary, detail: { ...summary, beschreibung: str(j.description || j.excerpt, 30000),
    arbeitszeit: str(j.employmentType), verguetung: salary } });
}
function nomadoItem(j: Nomado): Pair | null {
  const slug = str(j.slug, 200), title = str(j.title), url = safeExternalUrl(j.url);
  if (!slug || !title || !url || !/^[a-z\d_-]+$/i.test(slug) ||
    !["nomado24.de", "www.nomado24.de", "nomado24.com", "www.nomado24.com"].includes(new URL(url).hostname)) return null;
  const summary: JobListItem = { refnr: "nm-" + slug, titel: title, beruf: title,
    arbeitgeber: str(j.companyName), ort: str(j.location, 120) || "Remote",
    published: str(j.publishedAt, 40), externeUrl: url, source: "Nomado24",
    remote: j.remote === true || j.workArrangement === "remote", angebotsart: "1" };
  return remember({ summary, detail: { ...summary, beschreibung: str(j.description, 30000) ||
    `Mehr Informationen zur Stelle findest du in der Originalanzeige bei Nomado24.`,
    arbeitszeit: str(j.workArrangement), verguetung: j.currency && j.salaryMin ?
      `${j.salaryMin}–${j.salaryMax || ""} ${j.currency}` : undefined } });
}
function nomadoV2Item(j: NomadoV2): Pair | null {
  const slug = str(j.id, 220).replace(/^job_/, "");
  return nomadoItem({ slug, title: j.title, companyName: j.company?.name,
    location: j.location?.raw, remote: j.workArrangement === "remote",
    workArrangement: j.workArrangement, publishedAt: j.publishedAt,
    url: j.canonicalUrl, description: j.description });
}
function stableHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
async function readJson(url: string, seconds: number): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: "application/json" },
    next: { revalidate: seconds }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Provider HTTP " + response.status);
  return response.json();
}
async function getArbeitnow(): Promise<Pair[]> {
  const pages = await Promise.allSettled([1, 2, 3, 4, 5, 6, 7, 8].map(n =>
    readJson("https://www.arbeitnow.com/api/job-board-api?page=" + n, 1800)));
  const good = pages.filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled");
  if (!good.length) throw new Error("Arbeitnow unavailable");
  return good.flatMap(r => {
    const data = r.value as { data?: Arbeitnow[] };
    return Array.isArray(data.data) ? data.data.map(arbeitnowItem).filter((j): j is Pair => !!j) : [];
  });
}
async function getHimalayas(): Promise<Pair[]> {
  // Country search includes jobs open to German applicants, with server-side pagination.
  const pages = await Promise.allSettled([1, 2, 3, 4, 5].map(page =>
    readJson(`https://himalayas.app/jobs/api/search?country=DE&sort=recent&page=${page}`, 86400)));
  const good = pages.filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled");
  if (!good.length) throw new Error("Himalayas unavailable");
  return good.flatMap(r => {
    const data = r.value as { jobs?: Himalayas[] };
    return Array.isArray(data.jobs) ? data.jobs.map(himalayasItem).filter((j): j is Pair => !!j) : [];
  });
}
async function getNomado(): Promise<Pair[]> {
  const jobs: Pair[] = [];
  let cursor: string | undefined;
  let success = false;
  for (let page = 0; page < 5; page++) {
    try {
      const url = new URL("https://api.nomado24.de/api/public/v2/jobs");
      if (cursor) url.searchParams.set("cursor", cursor);
      else { url.searchParams.set("applicant_region", "DE"); url.searchParams.set("limit", "100"); }
      const data = await readJson(url.toString(), 3600) as {
        data?: NomadoV2[]; nextCursor?: string | null; hasNext?: boolean;
        pagination?: { nextCursor?: string | null; hasNext?: boolean };
      };
      success = true;
      if (Array.isArray(data.data)) jobs.push(...data.data.map(nomadoV2Item).filter((j): j is Pair => !!j));
      cursor = data.nextCursor || data.pagination?.nextCursor || undefined;
      if (!cursor || (data.hasNext === false || data.pagination?.hasNext === false)) break;
    } catch { if (!success) throw new Error("Nomado24 unavailable"); break; }
  }
  return jobs;
}
async function getJobicy(): Promise<Pair[]> {
  const responses = await Promise.allSettled(["germany", "europe"].map(geo =>
    readJson("https://jobicy.com/api/jobs?count=200&geo=" + geo, 3600)));
  const good = responses.filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled");
  if (!good.length) throw new Error("Jobicy unavailable");
  return good.flatMap(r => {
    const data = r.value as { jobs?: Jobicy[] };
    return Array.isArray(data.jobs) ? data.jobs.map(jobicyItem).filter((j): j is Pair => !!j) : [];
  });
}
function germanyEligible(location?: string): boolean {
  return /germany|deutschland|europe|\beu\b|emea|worldwide|anywhere|global|international/i.test(location || "");
}
async function getRemotive(): Promise<Pair[]> {
  // Remotive recommends fetching only a few times a day.
  const data = await readJson("https://remotive.com/api/remote-jobs", 21600) as { jobs?: Remotive[] };
  return Array.isArray(data.jobs) ? data.jobs.filter(j => germanyEligible(j.candidate_required_location))
    .map(remotiveItem).filter((j): j is Pair => !!j) : [];
}
async function loadFeeds(): Promise<{ items: Pair[]; unavailable: JobSource[] }> {
  const outcomes = await Promise.allSettled([getArbeitnow(), getJobicy(), getRemotive(), getHimalayas(), getNomado()]);
  const sources: JobSource[] = ["Arbeitnow", "Jobicy", "Remotive", "Himalayas", "Nomado24"];
  const unavailable = sources.filter((_, i) => outcomes[i].status === "rejected");
  if (unavailable.length === sources.length) throw new Error("All feeds unavailable");
  const found = new Map<string, Pair>();
  const duplicates = new Set<string>();
  for (const result of outcomes) if (result.status === "fulfilled")
    for (const item of result.value) {
      const j = item.summary;
      // Cross-provider deduplication: same company, role and place; keep first source.
      const key = [norm(j.arbeitgeber || ""), norm(j.titel), norm(j.ort || "")].join("|");
      if (found.has(j.refnr) || (j.arbeitgeber && duplicates.has(key))) continue;
      found.set(j.refnr, item);
      if (j.arbeitgeber) duplicates.add(key);
    }
  return { items: [...found.values()], unavailable };
}
const norm = (s: string) => s.toLocaleLowerCase("de-DE").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");
function matches({ summary: j, detail: d }: Pair, p: SearchParams): boolean {
  if (p.was) {
    const haystack = norm(j.titel + " " + (j.arbeitgeber || "") + " " + (d.beschreibung || ""));
    if (!norm(p.was).split(/\s+/).filter(Boolean).every(word => haystack.includes(word))) return false;
  }
  if (p.wo && !j.remote) {
    const query = norm(p.wo);
    const aliases: Record<string, string> = {
      munchen: "munich", muenchen: "munich", koln: "cologne", koeln: "cologne",
      nurnberg: "nuremberg", nuernberg: "nuremberg",
      frankfurtammain: "frankfurt", hannover: "hanover",
    };
    const compact = query.replace(/\s+/g, "");
    const location = norm(j.ort || "");
    if (!location.includes(query) && !location.includes(aliases[compact] || query)) return false;
  }
  if (p.angebotsart && j.angebotsart !== p.angebotsart) return false;
  if (p.arbeitszeit) {
    const code = new Set(p.arbeitszeit.split(";"));
    const kind = (d.arbeitszeit || "") + " " + j.titel;
    if (!((code.has("ho") && j.remote) ||
      (code.has("vz") && /full|vollzeit/i.test(kind)) ||
      (code.has("tz") && /part|teilzeit/i.test(kind)) ||
      (code.has("mj") && /mini.?job/i.test(kind)) ||
      (code.has("snw") && /shift|schicht|night|nacht|weekend/i.test(kind)))) return false;
  }
  if (p.veroeffentlichtseit && Number(p.veroeffentlichtseit) > 0) {
    const published = Date.parse(j.published || "");
    if (!Number.isFinite(published) || published < Date.now() - Number(p.veroeffentlichtseit) * 86400000) return false;
  }
  // Providers do not consistently expose permanent/temporary contract classification.
  if (p.befristung) {
    const kind = d.arbeitszeit || "";
    if (p.befristung === "1" && !/temporary|befristet|contract|fixed/i.test(kind)) return false;
    if (p.befristung === "2" && !/permanent|unbefristet/i.test(kind)) return false;
  }
  return true;
}
export async function searchJobs(p: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, Math.min(Math.trunc(p.page || 1), 100));
  const size = Math.max(1, Math.min(Math.trunc(p.size || 25), 100));
  const { items, unavailable } = await loadFeeds();
  const selected = items.filter(j => matches(j, p));
  selected.sort((a, b) => (Date.parse(b.summary.published || "") || 0) -
    (Date.parse(a.summary.published || "") || 0));
  return { jobs: selected.slice((page - 1) * size, page * size).map(j => j.summary),
    total: selected.length, page, size, unavailable, partial: unavailable.length > 0 };
}
export async function getJobDetail(refnr: string): Promise<JobDetail> {
  const item = index.get(refnr);
  if (item && item.expires > Date.now()) return item.pair.detail;
  const { items } = await loadFeeds();
  const detail = items.find(j => j.summary.refnr === refnr)?.detail;
  if (!detail) throw new Error("Vacancy unavailable in current provider feed");
  return detail;
}
export async function getSimilarJobs(detail: JobDetail, limit = 4): Promise<JobListItem[]> {
  const result = await searchJobs({ was: detail.beruf || detail.titel, size: 100 });
  return result.jobs.filter(j => j.refnr !== detail.refnr).slice(0, limit);
}
export async function suggestBerufe(was: string, limit = 8): Promise<{ label: string; count: number }[]> {
  const q = norm(was.trim());
  if (q.length < 2) return [];
  const { items } = await loadFeeds();
  const counts = new Map<string, number>();
  for (const { summary } of items) if (norm(summary.titel).includes(q))
    counts.set(summary.titel, (counts.get(summary.titel) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}
export function jobExternalLink(job: { externeUrl?: string | null; refnr: string }): string {
  return safeExternalUrl(job.externeUrl) || "/suche";
}
