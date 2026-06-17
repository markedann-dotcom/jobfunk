import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Impressum — JobFunke",
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <LegalShell titleKey="legal.imprint.title">
      <h2>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h2>
      <p>
        Marko Volchkov
        <br />
        Eugen-Adolff-Straße 30
        <br />
        71522 Backnang
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: 0176 70617449
        <br />
        E-Mail:{" "}
        <a href="mailto:markovolchkov32@gmail.com">markovolchkov32@gmail.com</a>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Marko Volchkov
        <br />
        Eugen-Adolff-Straße 30, 71522 Backnang
      </p>

      <h2>Art des Dienstes</h2>
      <p>
        JobFunke ist ein kostenloser, privat betriebener und werbefreier
        Such-Dienst, der öffentlich zugängliche Stellenangebote der Jobbörse
        der Bundesagentur für Arbeit aufbereitet und durchsuchbar macht.
        JobFunke ist ein unabhängiges Angebot und steht in{" "}
        <strong>keiner geschäftlichen oder behördlichen Verbindung</strong> zur
        Bundesagentur für Arbeit. Alle Marken- und Stellenrechte verbleiben bei
        den jeweiligen Inhabern.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Stelleninhalte stammen aus der offiziellen Schnittstelle der
        Bundesagentur für Arbeit und werden lediglich technisch aufbereitet
        dargestellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
        einzelnen Stellenangebote sind die jeweils inserierenden Unternehmen
        bzw. die Bundesagentur für Arbeit verantwortlich. Als Diensteanbieter
        sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach
        den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
        als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
        gespeicherte fremde Informationen zu überwachen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter (z. B. zu
        Bewerbungsseiten oder zur Bundesagentur für Arbeit), auf deren Inhalte
        wir keinen Einfluss haben. Für diese fremden Inhalte ist stets der
        jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Zum
        Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar.
      </p>

      <h2>Verwendete Dienste &amp; Nachweise</h2>
      <p>
        Stellendaten: Jobsuche-Schnittstelle der{" "}
        <strong>Bundesagentur für Arbeit</strong>.
      </p>
      <p>
        Kartendarstellung: Kartenmaterial und -kacheln ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap-Mitwirkende
        </a>
        , lizenziert unter der Open Database License (ODbL). Die Kartenanzeige
        erfolgt mithilfe der Open-Source-Bibliothek Leaflet.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht. Die Stelleninhalte
        unterliegen dem Urheber- und Nutzungsrecht der jeweiligen Inserenten
        bzw. der Bundesagentur für Arbeit.
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr/
        </a>
        . Wir sind nicht verpflichtet und nicht bereit, an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>
    </LegalShell>
  );
}
