import type { Metadata } from "next";
import { WikiIndex } from "@/components/wiki-index";

export const metadata: Metadata = {
  title: "Ratgeber & Tipps zur Jobsuche — JobFunke",
  description:
    "Kostenlose Anleitungen zu Bewerbung, Lebenslauf, Vorstellungsgespräch, Anerkennung von Abschlüssen und dem Start in den deutschen Arbeitsmarkt.",
  alternates: { canonical: "/ratgeber" },
  openGraph: {
    title: "Ratgeber & Tipps zur Jobsuche — JobFunke",
    description:
      "Praktische Anleitungen rund um Bewerbung, Lebenslauf und Vorstellungsgespräch in Deutschland.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RatgeberPage() {
  return <WikiIndex />;
}
