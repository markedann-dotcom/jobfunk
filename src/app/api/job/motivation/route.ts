import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

type MotivationBody = {
  titel?: string;
  arbeitgeber?: string;
  ort?: string;
  refnr?: string;
  isMinijob?: boolean;
  senderName?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MotivationBody;
    const { titel, arbeitgeber, ort, refnr, isMinijob, senderName } = body;

    const today = new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const firma = (arbeitgeber || "Ihr Unternehmen").trim();
    const firmenOrt = (ort || "").trim();
    const jobTitel = (titel || "die ausgeschriebene Position").trim();
    const name = (senderName || "").trim();

    // Имя для подписи: либо реальное, либо нейтральное "Bewerber/in",
    // но без квадратных плейсхолдеров вида [Ihr Name].
    const signatureName = name || "Bewerber/in";

    const anschriftZeile = firmenOrt ? `${firma}\n${firmenOrt}` : firma;
    const datumZeile = firmenOrt ? `${firmenOrt}, den ${today}` : `Den ${today}`;

    const betreff = `Bewerbung als ${jobTitel}`;
    const refZeile = refnr ? `Referenznummer: ${refnr}` : "";

    const einleitung = `Sehr geehrte Damen und Herren,`;

    const absatz1 = `mit großem Interesse habe ich Ihre Stellenanzeige gelesen. Die beschriebenen Aufgaben und das Profil Ihres Unternehmens haben mich sofort angesprochen, und ich bin überzeugt, dass ich mit meinen Fähigkeiten und meinem Engagement Ihr Team optimal verstärken kann. Aus diesem Grund bewerbe ich mich hiermit um die Position als ${jobTitel}.`;

    const absatz2 = isMinijob
      ? `Da es sich um eine Beschäftigung auf Minijob-Basis handelt, reizt mich besonders die Möglichkeit, meine Arbeitszeit flexibel einzubringen und gleichzeitig einen wertvollen Beitrag zu Ihren täglichen Abläufen zu leisten. Zuverlässigkeit, Pünktlichkeit und eine schnelle Auffassungsgabe gehören zu meinen Stärken.`
      : `In meinen bisherigen Tätigkeiten konnte ich bereits fundierte Erfahrungen sammeln, die für diese Position relevant sind. Ich zeichne mich durch eine eigenständige, zielorientierte Arbeitsweise aus und behalte auch in arbeitsintensiven Situationen den Überblick. Die Möglichkeit, mich in Ihrem Unternehmen fachlich und persönlich weiterzuentwickeln, motiviert mich sehr.`;

    const absatz3 = `Ich freue mich darauf, Ihre Anforderungen im Tagesgeschäft kennenzulernen und mich zügig in die neuen Aufgabengebiete einzuarbeiten. Teamfähigkeit, Flexibilität und ein hohes Maß an Motivation bringe ich für diese Stelle selbstverständlich mit.`;

    const schluss = `Über die Gelegenheit, mich Ihnen in einem persönlichen Gespräch vorzustellen, freue ich mich sehr.`;

    const grussformel = `Mit freundlichen Grüßen`;

    // Письмо собирается из чистых абзацев, разделённых ОДНОЙ пустой строкой.
    // PDF/preview-рендер опирается именно на такую структуру: пустая строка = новый абзац.
    const parts = [
      anschriftZeile,
      datumZeile,
      betreff,
      refZeile,
      einleitung,
      absatz1,
      absatz2,
      absatz3,
      schluss,
      grussformel,
      signatureName,
    ].filter((p) => p && p.length > 0);

    const letterText = parts.join("\n\n");

    return NextResponse.json({ text: letterText }, { status: 200 });
  } catch (error) {
    console.error("Motivation letter generation failed:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
