import type { Metadata } from "next";
import { getJobDetail, type JobDetail } from "@/lib/api";
import { JobDetailView } from "./detail";

export const dynamic = "force-dynamic";

const SITE = "JobFunke";
const SITE_URL = "https://www.jobfunke.de"; // TODO: замени на реальный домен, если другой
// TODO: замени на реальный путь к OG-баннеру (1200x630), если он у тебя есть
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

function strip(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Обрезает текст по границе слова, а не посередине, и не оставляет
 * висящую пунктуацию перед "…".
 */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${safe.replace(/[.,;:–-]+$/, "")}…`;
}

/**
 * Bundesagentur-данные не дают гарантии формата дат. Пытаемся распарсить
 * и ISO ("2026-06-21"), и немецкий формат ("21.06.2026"). Если не выходит —
 * возвращаем null, чтобы поле просто не попало в JSON-LD вместо невалидной строки.
 */
function toIsoDate(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Уже похоже на ISO (YYYY-MM-DD, возможно с временем)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : trimmed.slice(0, 10);
  }

  // Немецкий формат DD.MM.YYYY
  const deMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (deMatch) {
    const [, day, month, year] = deMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(d.getTime())) return null;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Последняя попытка — пусть сам Date разберётся
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime())
    ? null
    : fallback.toISOString().slice(0, 10);
}

/**
 * job.verguetung с Bundesagentur — произвольная строка ("3.200,00 EUR",
 * "15 € / Stunde", "nach Vereinbarung" и т.п.). Пытаемся вытащить число
 * для валидного schema.org baseSalary; если не получается — не добавляем
 * это поле вовсе, вместо отправки текста туда, где Google ожидает число.
 */
function parseSalaryValue(raw?: string): number | null {
  if (!raw) return null;
  // Берём первое похожее на число вхождение: "3.200,00" или "15,50" или "3200"
  const match = raw.match(/(\d{1,3}(?:[.\s]\d{3})*(?:,\d+)?|\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const normalized = match[0]
    .replace(/\./g, "") // убираем разделители тысяч "3.200" -> "3200"
    .replace(",", "."); // немецкая десятичная запятая -> точка
  const num = parseFloat(normalized);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function salaryUnitText(raw?: string): "HOUR" | "MONTH" | "YEAR" | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("stunde")) return "HOUR";
  if (s.includes("jahr")) return "YEAR";
  if (s.includes("monat")) return "MONTH";
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ refnr: string }>;
}): Promise<Metadata> {
  const { refnr } = await params;
  const decoded = decodeURIComponent(refnr);
  try {
    const job = await getJobDetail(decoded);
    const where = [job.ort, job.plz].filter(Boolean).join(" ");
    const titleParts = [job.titel, job.arbeitgeber, where].filter(Boolean);
    const title = `${titleParts.join(" · ")} | ${SITE}`;
    const desc =
      truncateAtWord(strip(job.beschreibung), 155) ||
      `${job.titel}${job.arbeitgeber ? ` bei ${job.arbeitgeber}` : ""}${where ? ` in ${where}` : ""} — jetzt auf ${SITE} entdecken.`;

    return {
      title,
      description: desc,
      alternates: {
        canonical: `${SITE_URL}/job/${encodeURIComponent(decoded)}`,
      },
      openGraph: {
        title,
        description: desc,
        type: "website",
        siteName: SITE,
        url: `${SITE_URL}/job/${encodeURIComponent(decoded)}`,
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: desc,
        images: [DEFAULT_OG_IMAGE],
      },
    };
  } catch {
    return {
      title: `Stellenangebot | ${SITE}`,
      description: `Stellenangebot auf ${SITE} — dem kostenlosen Jobportal für Deutschland.`,
    };
  }
}

function employmentType(arbeitszeit?: string): string[] | undefined {
  if (!arbeitszeit) return undefined;
  const s = arbeitszeit.toLowerCase();
  const out: string[] = [];
  if (s.includes("vollzeit")) out.push("FULL_TIME");
  if (s.includes("teilzeit")) out.push("PART_TIME");
  if (s.includes("minijob") || s.includes("geringfügig")) out.push("OTHER");
  return out.length ? out : undefined;
}

/**
 * Google for Jobs требует validThrough; без даты закрытия вакансии у нас
 * её нет, поэтому подстраховываемся разумным дефолтом (+60 дней от публикации,
 * либо от текущей даты, если даты публикации тоже нет). Это не "обманывает"
 * данные — просто не даёт объявлению считаться просроченным раньше времени.
 */
function buildValidThrough(datePosted: string | null): string {
  const base = datePosted ? new Date(datePosted) : new Date();
  const valid = new Date(base);
  valid.setDate(valid.getDate() + 60);
  return valid.toISOString().slice(0, 10);
}

function buildJsonLd(job: JobDetail, refnr: string): Record<string, unknown> {
  const datePosted = toIsoDate(job.published);
  const salaryValue = parseSalaryValue(job.verguetung);
  const salaryUnit = salaryUnitText(job.verguetung);

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.titel,
    description: strip(job.beschreibung) || job.titel,
    url: `${SITE_URL}/job/${encodeURIComponent(refnr)}`,
    identifier: {
      "@type": "PropertyValue",
      name: SITE,
      value: refnr,
    },
    ...(datePosted ? { datePosted } : {}),
    validThrough: buildValidThrough(datePosted),
    ...(job.arbeitgeber
      ? { hiringOrganization: { "@type": "Organization", name: job.arbeitgeber } }
      : {}),
    ...(job.ort || job.plz
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              ...(job.strasse ? { streetAddress: job.strasse } : {}),
              ...(job.plz ? { postalCode: job.plz } : {}),
              ...(job.ort ? { addressLocality: job.ort } : {}),
              addressCountry: "DE",
            },
          },
        }
      : {}),
    ...(employmentType(job.arbeitszeit)
      ? { employmentType: employmentType(job.arbeitszeit) }
      : {}),
    // baseSalary добавляем только если реально удалось распарсить число —
    // иначе Google получит невалидный тип в MonetaryAmount.value.
    ...(salaryValue
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "EUR",
            value: {
              "@type": "QuantitativeValue",
              value: salaryValue,
              unitText: salaryUnit || "MONTH",
            },
          },
        }
      : {}),
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ refnr: string }>;
}) {
  const { refnr } = await params;
  
  // Next.js автоматически декодирует параметры строки запроса.
  // Вызов decodeURIComponent здесь страхует от повторного/избыточного кодирования,
  // гарантируя, что в 'decoded' лежит чистая строка ID вакансии (например: "123/456-S").
  const decoded = decodeURIComponent(refnr);
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const job = await getJobDetail(decoded);
    jsonLd = buildJsonLd(job, decoded);
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON.stringify экранирует кавычки, но не "</script>" внутри строк —
          // подстраховываемся, чтобы вредоносный/неожиданный текст вакансии
          // не мог преждевременно закрыть тег <script>.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      
      {/* Критически важно: передаем в клиентский компонент ENCODED строку refnr.
        Поскольку JobDetailView внутри себя делает decodeURIComponent, а также склеивает
        путь к внутреннему API (`/api/job/${refnr}`), строка обязана быть заэкранирована.
        Это предотвратит разрыв URL-адреса слэшами при прямой навигации.
      */}
      <JobDetailView refnr={encodeURIComponent(decoded)} />
    </>
  );
}
