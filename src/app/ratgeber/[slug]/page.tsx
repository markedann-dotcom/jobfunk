import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/articles";
import { WikiArticle } from "@/components/wiki-article";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Ratgeber — JobFunke" };
  return {
    title: `${a.title.de} — JobFunke Ratgeber`,
    description: a.excerpt.de,
    alternates: { canonical: `/ratgeber/${a.slug}` },
    openGraph: {
      title: a.title.de,
      description: a.excerpt.de,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title.de,
    description: article.excerpt.de,
    inLanguage: "de",
    author: { "@type": "Organization", name: "JobFunke" },
    publisher: { "@type": "Organization", name: "JobFunke" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WikiArticle article={article} />
    </>
  );
}
