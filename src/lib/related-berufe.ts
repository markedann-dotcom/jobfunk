// Related profession suggestions. Best-effort static map keyed by normalized substrings.
// Returns up to 6 related search keywords for a given beruf/keyword.

const MAP: { match: string[]; related: string[] }[] = [
  { match: ["koch", "köch", "küche"], related: ["Beikoch", "Küchenhilfe", "Restaurantfachmann", "Systemgastronomie", "Bäcker", "Konditor"] },
  { match: ["pflege", "altenpfleg", "krankenpfleg"], related: ["Pflegehelfer", "Altenpfleger", "Gesundheits- und Krankenpfleger", "Pflegefachkraft", "Betreuungskraft", "Hauswirtschaft"] },
  { match: ["elektr"], related: ["Elektroniker", "Elektroinstallateur", "Mechatroniker", "Industrieelektriker", "Elektrohelfer", "Servicetechniker"] },
  { match: ["lager", "logistik", "kommission"], related: ["Lagerhelfer", "Staplerfahrer", "Kommissionierer", "Fachkraft Lagerlogistik", "Versandmitarbeiter", "Produktionshelfer"] },
  { match: ["fahrer", "kraftfahr", "lkw", "berufskraft"], related: ["Berufskraftfahrer", "LKW-Fahrer", "Auslieferungsfahrer", "Busfahrer", "Kurierfahrer", "Staplerfahrer"] },
  { match: ["maler", "lackier"], related: ["Maler und Lackierer", "Trockenbauer", "Bodenleger", "Stuckateur", "Bauhelfer", "Fassadenmonteur"] },
  { match: ["reinig", "putz", "gebäudereinig"], related: ["Gebäudereiniger", "Raumpfleger", "Glasreiniger", "Unterhaltsreinigung", "Hauswirtschaft", "Hotelreinigung"] },
  { match: ["verkäuf", "verkauf", "kassier", "einzelhandel"], related: ["Verkäufer", "Kaufmann im Einzelhandel", "Kassierer", "Filialmitarbeiter", "Fachverkäufer", "Aushilfe Verkauf"] },
  { match: ["bau", "maurer", "beton"], related: ["Maurer", "Bauhelfer", "Betonbauer", "Tiefbauer", "Trockenbauer", "Polier"] },
  { match: ["it", "software", "entwickl", "informatik"], related: ["Softwareentwickler", "Fachinformatiker", "IT-Administrator", "Webentwickler", "DevOps", "IT-Support"] },
  { match: ["büro", "verwaltung", "sachbearb", "kaufmann", "kauffrau"], related: ["Bürokaufmann", "Sachbearbeiter", "Kaufmännische Fachkraft", "Assistenz", "Sekretär", "Buchhalter"] },
  { match: ["schweiß", "metall", "schlosser"], related: ["Schweißer", "Metallbauer", "Industriemechaniker", "Schlosser", "Zerspanungsmechaniker", "Konstruktionsmechaniker"] },
  { match: ["erzieh", "kita", "pädagog"], related: ["Erzieher", "Kinderpfleger", "Sozialpädagoge", "Pädagogische Fachkraft", "Heilerziehungspfleger", "Betreuungskraft"] },
  { match: ["friseur", "kosmetik"], related: ["Friseur", "Kosmetiker", "Nageldesigner", "Barbier", "Stylist", "Maskenbildner"] },
];

const FALLBACK = ["Vollzeit", "Teilzeit", "Aushilfe", "Quereinsteiger", "Minijob", "Ausbildung"];

export function relatedBerufe(input?: string): string[] {
  const q = (input ?? "").toLowerCase().trim();
  if (!q) return [];
  for (const row of MAP) {
    if (row.match.some((m) => q.includes(m))) {
      return row.related.filter((r) => r.toLowerCase() !== q).slice(0, 6);
    }
  }
  return FALLBACK;
}
