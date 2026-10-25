import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Haftungsausschluss — JobFunke",
  robots: { index: true, follow: true },
};

export default function HaftungsausschlussPage() {
  return (
    <LegalShell titleKey="legal.disclaimer.title">
      <p className="lead">
        JobFunke ist ein kostenloser, privat betriebener Such-Dienst, der
        öffentlich zugängliche Stellenangebote aus der Jobbörse der
        Bundesagentur für Arbeit technisch aufbereitet und durchsuchbar macht.
        JobFunke ist <strong>kein Arbeitgeber, kein Personalvermittler und kein
        Urheber der angezeigten Stellenangebote</strong>.
      </p>

      <h2>1. Keine Haftung für Stellenangebote und deren Inhalte</h2>
      <p>
        Sämtliche auf JobFunke angezeigten Stellenangebote, Beschreibungen,
        Gehaltsangaben, Arbeitgeberangaben, Kontaktdaten und sonstigen
        Informationen stammen <strong>ausschließlich von Dritten</strong> – den
        inserierenden Unternehmen, Personaldienstleistern bzw. der Bundesagentur
        für Arbeit – und werden über deren öffentliche Schnittstelle automatisiert
        übernommen. JobFunke erstellt, prüft, redigiert oder verifiziert diese
        Inhalte <strong>nicht</strong>.
      </p>
      <p>
        Für die <strong>Richtigkeit, Vollständigkeit, Aktualität, Seriosität,
        Rechtmäßigkeit und Verfügbarkeit</strong> der einzelnen Stellenangebote
        wird daher <strong>keinerlei Haftung oder Gewähr übernommen</strong>. Ein
        Anspruch auf Bestehen, Fortbestehen oder Vermittlung einer angezeigten
        Stelle besteht nicht. Stellenangebote können bereits besetzt, abgelaufen,
        fehlerhaft oder zwischenzeitlich entfernt worden sein.
      </p>

      <h2>2. Keine Vermittlung, kein Beschäftigungsverhältnis</h2>
      <p>
        Über JobFunke kommt <strong>kein Vertrags-, Arbeits- oder
        Vermittlungsverhältnis</strong> zustande. JobFunke tritt weder als Partei
        noch als Vermittler zwischen Bewerbern und Arbeitgebern auf. Bewerbungen,
        Vertragsverhandlungen und Arbeitsverhältnisse finden ausschließlich
        unmittelbar zwischen den Nutzern und den jeweiligen Arbeitgebern statt.
      </p>

      <h2>3. Warnung vor unseriösen Angeboten / Betrug</h2>
      <p>
        Da die Inhalte von Dritten stammen, kann nicht ausgeschlossen werden,
        dass vereinzelt unseriöse oder betrügerische Angebote enthalten sind.
        Nutzer werden ausdrücklich gebeten, <strong>niemals Geld zu zahlen,
        Vorkasse zu leisten oder sensible persönliche Daten (z. B. Ausweis-,
        Bank- oder Kreditkartendaten) zu übermitteln</strong>, um eine Stelle zu
        erhalten. JobFunke haftet nicht für Schäden, die aus dem Kontakt mit
        inserierenden Dritten entstehen.
      </p>

      <h2>4. Keine Rechts-, Steuer- oder Berufsberatung</h2>
      <p>
        Die auf JobFunke bereitgestellten Informationen dienen ausschließlich
        der allgemeinen Information und stellen <strong>keine rechtliche,
        steuerliche, arbeitsrechtliche oder berufliche Beratung</strong> dar. Für
        verbindliche Auskünfte wenden Sie sich bitte an die zuständigen Stellen
        (z. B. Bundesagentur für Arbeit, Rechts- oder Steuerberatung).
      </p>

      <h2>4a. Brutto-Netto-Rechner und Bewerbungs-Hinweise</h2>
      <p>
        Der Brutto-Netto-Rechner liefert eine{" "}
        <strong>stark vereinfachte, unverbindliche Schätzung</strong> auf Basis
        pauschaler Annahmen. Er berücksichtigt nicht alle individuellen Faktoren
        (z. B. Freibeträge, Bundesland, Zusatzbeiträge, weitere Einkünfte) und
        kann erheblich vom tatsächlichen Nettogehalt abweichen. Die Ergebnisse
        stellen <strong>keine Steuer- oder Sozialversicherungsberatung</strong>{" "}
        dar. Ebenso sind die Bewerbungs-Checklisten und Berufs-Vorschläge nur
        allgemeine, unverbindliche Hinweise. Für verbindliche Berechnungen und
        Auskünfte sind die zuständigen Stellen (Finanzamt, Steuerberatung,
        Sozialversicherungsträger) maßgeblich. Eine Haftung für Entscheidungen,
        die auf Grundlage dieser Hilfsmittel getroffen werden, ist ausgeschlossen.
      </p>

      <h2>4b. Kartendarstellung</h2>
      <p>
        Die Standortanzeige auf der Karte erfolgt auf Basis der von der externen
        Schnittstelle gelieferten Koordinaten und nutzt Kartenmaterial von
        OpenStreetMap. Standorte können <strong>ungenau, unvollständig oder
        näherungsweise</strong> dargestellt sein. Für die Richtigkeit der
        Standort- und Kartendaten wird keine Gewähr übernommen.
      </p>

      <h2>5. Verfügbarkeit des Dienstes</h2>
      <p>
        Es besteht kein Anspruch auf ständige Verfügbarkeit, Fehlerfreiheit oder
        Vollständigkeit des Dienstes. JobFunke greift auf eine externe
        Schnittstelle zu; bei deren Ausfall, Änderung oder Einschränkung können
        zeitweise keine oder unvollständige Ergebnisse angezeigt werden. Ein
        Schadensersatzanspruch hieraus ist ausgeschlossen.
      </p>

      <h2>6. Externe Links</h2>
      <p>
        JobFunke verweist über Links auf externe Websites Dritter (z. B.
        Bewerbungsseiten, arbeitsagentur.de). Auf deren Gestaltung und Inhalte
        haben wir keinen Einfluss; hierfür ist ausschließlich der jeweilige
        Anbieter verantwortlich. Zum Zeitpunkt der Verlinkung waren keine
        rechtswidrigen Inhalte erkennbar.
      </p>

      <h2>7. Haftungsbeschränkung</h2>
      <p>
        Eine Haftung des Betreibers ist – soweit gesetzlich zulässig –
        ausgeschlossen. Unberührt bleibt die Haftung für Schäden aus der
        Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden,
        die auf einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung des
        Betreibers beruhen. Bei der Verletzung wesentlicher Vertragspflichten ist
        die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
      </p>

      <h2>8. Unabhängigkeit</h2>
      <p>
        JobFunke ist ein unabhängiges, privates Angebot und steht in{" "}
        <strong>keiner geschäftlichen, behördlichen oder kooperativen
        Verbindung</strong> zur Bundesagentur für Arbeit. Alle Marken-,
        Namens- und Stellenrechte verbleiben bei den jeweiligen Inhabern.
      </p>

      <p style={{ marginTop: "1.5rem" }}>
        <strong>
          Mit der Nutzung von JobFunke erkennen Sie diesen Haftungsausschluss an.
        </strong>
      </p>
    </LegalShell>
  );
}
