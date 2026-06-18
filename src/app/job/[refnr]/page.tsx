import type { Metadata } from "next";
import { getJobDetail } from "@/lib/api";
import { JobDetailView } from "./detail";
// import SimilarJobs from "@/components/SimilarJobs";

export const dynamic = "force-dynamic";

const SITE = "JobFunke";

function strip(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
      strip(job.beschreibung).slice(0, 155) ||
      `${job.titel}${job.arbeitgeber ? ` bei ${job.arbeitgeber}` : ""}${where ? ` in ${where}` : ""} — jetzt auf ${SITE} entdecken.`;
    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        type: "website",
        siteName: SITE,
      },
      twitter: { card: "summary", title, description: desc },
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

export default async function JobPage({
  params,
}: {
  params: Promise<{ refnr: string }>;
}) {
  const { refnr } = await params;
  const decoded = decodeURIComponent(refnr);

  let jsonLd: Record<string, unknown> | null = null;
  try {
    const job = await getJobDetail(decoded);
    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.titel,
      description: strip(job.beschreibung) || job.titel,
      ...(job.published ? { datePosted: job.published } : {}),
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
      ...(employmentType(job.arbeitszeit) ? { employmentType: employmentType(job.arbeitszeit) } : {}),
      ...(job.verguetung
        ? { baseSalary: { "@type": "MonetaryAmount", currency: "EUR", value: job.verguetung } }
        : {}),
    };
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobDetailView refnr={decoded} />
      {/* <SimilarJobs refnr={decoded} /> */}
    </>
  );
}
