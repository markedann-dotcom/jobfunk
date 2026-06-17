// Compact dataset of common German cities with a representative PLZ prefix range.
// Used for the "Wo?" autocomplete: typing a city name OR a PLZ suggests matches.
// Not exhaustive — covers the biggest / most-searched locations.

export interface CityEntry {
  name: string;
  plz: string; // representative postal code
  region: string;
}

export const CITIES: CityEntry[] = [
  { name: "Berlin", plz: "10115", region: "Berlin" },
  { name: "Hamburg", plz: "20095", region: "Hamburg" },
  { name: "München", plz: "80331", region: "Bayern" },
  { name: "Köln", plz: "50667", region: "Nordrhein-Westfalen" },
  { name: "Frankfurt am Main", plz: "60311", region: "Hessen" },
  { name: "Stuttgart", plz: "70173", region: "Baden-Württemberg" },
  { name: "Düsseldorf", plz: "40213", region: "Nordrhein-Westfalen" },
  { name: "Leipzig", plz: "04109", region: "Sachsen" },
  { name: "Dortmund", plz: "44135", region: "Nordrhein-Westfalen" },
  { name: "Essen", plz: "45127", region: "Nordrhein-Westfalen" },
  { name: "Bremen", plz: "28195", region: "Bremen" },
  { name: "Dresden", plz: "01067", region: "Sachsen" },
  { name: "Hannover", plz: "30159", region: "Niedersachsen" },
  { name: "Nürnberg", plz: "90402", region: "Bayern" },
  { name: "Duisburg", plz: "47051", region: "Nordrhein-Westfalen" },
  { name: "Bochum", plz: "44787", region: "Nordrhein-Westfalen" },
  { name: "Wuppertal", plz: "42103", region: "Nordrhein-Westfalen" },
  { name: "Bielefeld", plz: "33602", region: "Nordrhein-Westfalen" },
  { name: "Bonn", plz: "53111", region: "Nordrhein-Westfalen" },
  { name: "Münster", plz: "48143", region: "Nordrhein-Westfalen" },
  { name: "Karlsruhe", plz: "76133", region: "Baden-Württemberg" },
  { name: "Mannheim", plz: "68159", region: "Baden-Württemberg" },
  { name: "Augsburg", plz: "86150", region: "Bayern" },
  { name: "Wiesbaden", plz: "65183", region: "Hessen" },
  { name: "Mönchengladbach", plz: "41061", region: "Nordrhein-Westfalen" },
  { name: "Gelsenkirchen", plz: "45879", region: "Nordrhein-Westfalen" },
  { name: "Aachen", plz: "52062", region: "Nordrhein-Westfalen" },
  { name: "Braunschweig", plz: "38100", region: "Niedersachsen" },
  { name: "Chemnitz", plz: "09111", region: "Sachsen" },
  { name: "Kiel", plz: "24103", region: "Schleswig-Holstein" },
  { name: "Halle (Saale)", plz: "06108", region: "Sachsen-Anhalt" },
  { name: "Magdeburg", plz: "39104", region: "Sachsen-Anhalt" },
  { name: "Freiburg im Breisgau", plz: "79098", region: "Baden-Württemberg" },
  { name: "Krefeld", plz: "47798", region: "Nordrhein-Westfalen" },
  { name: "Mainz", plz: "55116", region: "Rheinland-Pfalz" },
  { name: "Lübeck", plz: "23552", region: "Schleswig-Holstein" },
  { name: "Erfurt", plz: "99084", region: "Thüringen" },
  { name: "Oberhausen", plz: "46045", region: "Nordrhein-Westfalen" },
  { name: "Rostock", plz: "18055", region: "Mecklenburg-Vorpommern" },
  { name: "Kassel", plz: "34117", region: "Hessen" },
  { name: "Hagen", plz: "58095", region: "Nordrhein-Westfalen" },
  { name: "Potsdam", plz: "14467", region: "Brandenburg" },
  { name: "Saarbrücken", plz: "66111", region: "Saarland" },
  { name: "Hamm", plz: "59065", region: "Nordrhein-Westfalen" },
  { name: "Ludwigshafen am Rhein", plz: "67059", region: "Rheinland-Pfalz" },
  { name: "Oldenburg", plz: "26121", region: "Niedersachsen" },
  { name: "Mülheim an der Ruhr", plz: "45468", region: "Nordrhein-Westfalen" },
  { name: "Osnabrück", plz: "49074", region: "Niedersachsen" },
  { name: "Leverkusen", plz: "51373", region: "Nordrhein-Westfalen" },
  { name: "Heidelberg", plz: "69117", region: "Baden-Württemberg" },
  { name: "Darmstadt", plz: "64283", region: "Hessen" },
  { name: "Solingen", plz: "42651", region: "Nordrhein-Westfalen" },
  { name: "Regensburg", plz: "93047", region: "Bayern" },
  { name: "Herne", plz: "44623", region: "Nordrhein-Westfalen" },
  { name: "Paderborn", plz: "33098", region: "Nordrhein-Westfalen" },
  { name: "Neuss", plz: "41460", region: "Nordrhein-Westfalen" },
  { name: "Ingolstadt", plz: "85049", region: "Bayern" },
  { name: "Offenbach am Main", plz: "63065", region: "Hessen" },
  { name: "Fürth", plz: "90762", region: "Bayern" },
  { name: "Würzburg", plz: "97070", region: "Bayern" },
  { name: "Ulm", plz: "89073", region: "Baden-Württemberg" },
  { name: "Heilbronn", plz: "74072", region: "Baden-Württemberg" },
  { name: "Pforzheim", plz: "75175", region: "Baden-Württemberg" },
  { name: "Wolfsburg", plz: "38440", region: "Niedersachsen" },
  { name: "Göttingen", plz: "37073", region: "Niedersachsen" },
  { name: "Bottrop", plz: "46236", region: "Nordrhein-Westfalen" },
  { name: "Reutlingen", plz: "72764", region: "Baden-Württemberg" },
  { name: "Koblenz", plz: "56068", region: "Rheinland-Pfalz" },
  { name: "Bremerhaven", plz: "27568", region: "Bremen" },
  { name: "Recklinghausen", plz: "45657", region: "Nordrhein-Westfalen" },
  { name: "Bergisch Gladbach", plz: "51465", region: "Nordrhein-Westfalen" },
  { name: "Jena", plz: "07743", region: "Thüringen" },
  { name: "Remscheid", plz: "42853", region: "Nordrhein-Westfalen" },
  { name: "Trier", plz: "54290", region: "Rheinland-Pfalz" },
  { name: "Salzgitter", plz: "38226", region: "Niedersachsen" },
  { name: "Moers", plz: "47441", region: "Nordrhein-Westfalen" },
  { name: "Siegen", plz: "57072", region: "Nordrhein-Westfalen" },
  { name: "Gütersloh", plz: "33330", region: "Nordrhein-Westfalen" },
  { name: "Hildesheim", plz: "31134", region: "Niedersachsen" },
  { name: "Backnang", plz: "71522", region: "Baden-Württemberg" },
  { name: "Esslingen am Neckar", plz: "73728", region: "Baden-Württemberg" },
  { name: "Ludwigsburg", plz: "71634", region: "Baden-Württemberg" },
  { name: "Tübingen", plz: "72070", region: "Baden-Württemberg" },
  { name: "Konstanz", plz: "78462", region: "Baden-Württemberg" },
  { name: "Flensburg", plz: "24937", region: "Schleswig-Holstein" },
  { name: "Gera", plz: "07545", region: "Thüringen" },
  { name: "Cottbus", plz: "03046", region: "Brandenburg" },
  { name: "Witten", plz: "58452", region: "Nordrhein-Westfalen" },
  { name: "Zwickau", plz: "08056", region: "Sachsen" },
  { name: "Iserlohn", plz: "58636", region: "Nordrhein-Westfalen" },
  { name: "Düren", plz: "52349", region: "Nordrhein-Westfalen" },
  { name: "Ratingen", plz: "40878", region: "Nordrhein-Westfalen" },
  { name: "Lünen", plz: "44532", region: "Nordrhein-Westfalen" },
  { name: "Marl", plz: "45768", region: "Nordrhein-Westfalen" },
  { name: "Velbert", plz: "42549", region: "Nordrhein-Westfalen" },
  { name: "Minden", plz: "32423", region: "Nordrhein-Westfalen" },
  { name: "Worms", plz: "67547", region: "Rheinland-Pfalz" },
  { name: "Dorsten", plz: "46282", region: "Nordrhein-Westfalen" },
  { name: "Lüneburg", plz: "21335", region: "Niedersachsen" },
  { name: "Detmold", plz: "32756", region: "Nordrhein-Westfalen" },
  { name: "Marburg", plz: "35037", region: "Hessen" },
  { name: "Landshut", plz: "84028", region: "Bayern" },
  { name: "Schwerin", plz: "19053", region: "Mecklenburg-Vorpommern" },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .trim();
}

export function searchCities(query: string, limit = 6): CityEntry[] {
  const q = query.trim();
  if (q.length < 2) return [];

  // Numeric → PLZ prefix match
  if (/^\d+$/.test(q)) {
    return CITIES.filter((c) => c.plz.startsWith(q)).slice(0, limit);
  }

  const nq = norm(q);
  const starts: CityEntry[] = [];
  const contains: CityEntry[] = [];
  for (const c of CITIES) {
    const nc = norm(c.name);
    if (nc.startsWith(nq)) starts.push(c);
    else if (nc.includes(nq)) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
}
