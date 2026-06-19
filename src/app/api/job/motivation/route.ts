import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { titel, arbeitgeber, ort, refnr, isMinijob } = await req.json();

    const today = new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const firma = arbeitgeber || "Unternehmen X";
    const firmenOrt = ort || "Deutschland";
    
    // Формируем текст письма по стандартам DIN 5008
    const letterText = `
[Ihr Vorname] [Ihr Nachname]
[Ihre Straße und Hausnummer]
[Ihre PLZ und Ort]
[Ihre Telefonnummer]
[Ihre E-Mail-Adresse]

${firma}
Ansprechpartner für Bewerbungen
${firmenOrt}

${firmenOrt}, den ${today}

Bewerbung als ${titel}
Referenznummer: ${refnr || "Initiativ"}

Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihr Stellenangebot auf dem Jobportal JobFunke gelesen. Die von Ihnen beschriebenen Aufgaben und das Profil Ihres Unternehmens haben mich sofort angesprochen. Da я davon überzeugt bin, dass ich mit meinen Fähigkeiten и meinem Engagement Ihr Team optimal verstärken kann, bewerbe ich mich hiermit um diese Position.

${isMinijob 
  ? `Da es sich um eine Beschäftigung auf Minijob-Basis handelt, reizt mich besonders die Möglichkeit, meine Arbeitszeit flexibel einzubringen и gleichzeitig einen wertvollen Beitrag zu Ihren täglichen Abläufen zu leisten. Zuverlässigkeit, Pünktlichkeit и eine schnelle Auffassungsgabe gehören zu meinen absoluten Stärken.`
  : `In meinen bisherigen Tätigkeiten konnte ich bereits fundierte Erfahrungen im relevanten Bereich sammeln. Ich zeichne mich durch eine eigenständige, zielorientierte Arbeitsweise aus и behalte auch in stressigen Situationen den Überblick. Die Möglichkeit, mich in Ihrem Unternehmen fachlich и persönlich weiterzuentwickeln, motiviert mich sehr.`
}

Ich freue mich darauf, Ihre Anforderungen im Tagesgeschäft kennenzulernen и mich schnell in die neuen Aufgabengebiete einzuarbeiten. Teamfähigkeit, Flexibilität и ein hohes Maß an Motivation bringe ich für diese Stelle selbstverständlich mit.

Über die Gelegenheit, mich Ihnen in einem persönlichen Gespräch vorzustellen, freue ich mich sehr.

Mit freundlichen Grüßen

[Ihr Vorname] [Ihr Nachname]
`.trim();

    return NextResponse.json({ text: letterText }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
