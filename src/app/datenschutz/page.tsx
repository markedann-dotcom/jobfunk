import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — JobFunke",
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <LegalShell titleKey="legal.privacy.title">
      <p className="lead">
        Der Schutz deiner Daten ist uns wichtig. JobFunke ist datensparsam
        aufgebaut: Eine Anmeldung über Google ist optional; es gibt
        <strong> kein Tracking zu Werbezwecken</strong>. Im Folgenden informieren wir dich
        gemäß Art. 13 DSGVO über die Verarbeitung personenbezogener Daten.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Marko Volchkov
        <br />
        Eugen-Adolff-Straße 30, 71522 Backnang, Deutschland
        <br />
        E-Mail:{" "}
        <a href="mailto:markovolchkov32@gmail.com">markovolchkov32@gmail.com</a>
        <br />
        Telefon: 0176 70617449
      </p>

      <h2>2. Welche Daten verarbeitet werden</h2>
      <h3>a) Server-Logfiles</h3>
      <p>
        Beim Aufruf der Website werden durch den Hosting-Provider automatisch
        technische Informationen erfasst (IP-Adresse in gekürzter/anonymisierter
        Form, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Browsertyp und
        Betriebssystem). Diese Daten dienen ausschließlich dem sicheren und
        stabilen Betrieb der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO (berechtigtes Interesse am sicheren Betrieb). Diese Daten werden
        nicht mit anderen Datenquellen zusammengeführt.
      </p>

      <h3>b) Jobsuche-Anfragen</h3>
      <p>
        Deine Suchbegriffe (z. B. Beruf, Ort, Postleitzahl) werden an unseren
        Server übermittelt und auf den abgerufenen Stellenfeeds angewendet. Wir{" "}
        <strong>speichern keine personenbezogenen Suchprofile</strong>.
        Suchergebnisse werden lediglich für wenige Minuten serverseitig
        zwischengespeichert (Cache), um die Schnittstelle zu entlasten.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO.
      </p>

      <h3>c) Lokale Speicherung (localStorage)</h3>
      <p>
        Eine Reihe von Komfort- und Einstellungsdaten wird ausschließlich{" "}
        <strong>lokal in deinem Browser</strong> (localStorage) gespeichert.
        Bei Nutzung ohne Konto bleiben diese Daten auf deinem Gerät. Wenn du
        dich anmeldest, wird deine Merkliste mit dem Nutzerkonto synchronisiert.
        Die lokalen Daten kannst du durch Löschen der Browserdaten entfernen:
      </p>
      <ul>
        <li>gewählte Sprache (<code>jf_lang</code>) und Designmodus hell/dunkel (<code>jf_theme</code>);</li>
        <li>Merkliste – gespeicherte Stellenangebote (<code>jf_favorites</code>);</li>
        <li>zuletzt angesehene Stellen (<code>jf_recent</code>);</li>
        <li>Suchverlauf und gespeicherte Suchen (<code>jf_search_history</code>, <code>jf_saved_searches</code>);</li>
        <li>Status von Hinweisen wie Willkommens-Einblendung, Cookie-Auswahl und App-Installationshinweis (<code>jf_onboarded</code>, <code>jf_cookie_consent</code>, <code>jf_pwa_dismissed</code>).</li>
      </ul>
      <p>
        Es werden dabei <strong>keine personenbezogenen Profile</strong> gebildet
        und keine Daten zu Werbe- oder Analysezwecken erhoben.
      </p>

      <h3>d) Brutto-Netto-Rechner</h3>
      <p>
        Der auf JobFunke angebotene Brutto-Netto-Rechner verarbeitet die von dir
        eingegebenen Werte (z. B. Bruttogehalt, Steuerklasse) ausschließlich{" "}
        <strong>lokal in deinem Browser</strong>. Es findet keine Übertragung
        dieser Eingaben an unseren Server oder an Dritte statt und es erfolgt
        keine Speicherung. Die Berechnung ist eine unverbindliche Schätzung und
        stellt keine Steuerberatung dar.
      </p>

      <h3>e) Optionales Google-Konto und Cloud-Merkliste</h3>
      <p>
        Bei der freiwilligen Google-Anmeldung verarbeitet Supabase Auth
        die für die Anmeldung erforderlichen Kontodaten (z. B. E-Mail,
        Name und eine technische Nutzer-ID). Google ist für die Authentifizierung
        eingebunden. Deine gespeicherten Stellenangebote werden bei Nutzung
        des Kontos in einer Supabase-Datenbank deinem Nutzerkonto zugeordnet.
        Zum Abmelden nutze die Konto-Seite. Informationen zu Datenlöschung
        und Anfragen erhältst du beim oben genannten Verantwortlichen.
        Die Anmeldung wird erst aktiviert, wenn der Betreiber Supabase
        entsprechend konfiguriert hat.
      </p>

      <h2>3. Cookies und lokale Speicherung</h2>
      <p>
        JobFunke setzt <strong>keine Tracking- oder Werbe-Cookies</strong> ein.
        Es werden lediglich technisch notwendige Speichermechanismen
        (localStorage, Service-Worker-Cache und bei angemeldeten Nutzern
        technisch notwendige Sitzungsspeicherung) für Einstellungen,
        Merkliste und Offline-Funktionalität verwendet, die keiner Einwilligung
        bedürfen (§ 25 Abs. 2 TDDDG). Deine Cookie-/Speicher-Auswahl kannst du
        jederzeit über den Link „Cookie-Einstellungen“ im Footer erneut öffnen.
      </p>

      <h2>3a. Kartendarstellung (OpenStreetMap)</h2>
      <p>
        Zur Anzeige von Stellen auf einer Karte nutzen wir die Kartendienste von{" "}
        <strong>OpenStreetMap</strong>. Die Kartenkacheln werden über die Server
        der OpenStreetMap Foundation (OSMF) geladen. Die Karte wird{" "}
        <strong>erst geladen, wenn du aktiv in die Kartenansicht wechselst</strong>.
        Dabei wird technisch bedingt deine IP-Adresse an die Tile-Server von
        OpenStreetMap übermittelt; dies ist für die Auslieferung der Kartenbilder
        erforderlich. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an einer anschaulichen Darstellung der
        Suchergebnisse). Anbieter ist die OpenStreetMap Foundation, St John’s
        Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes
        Königreich. Weitere Informationen:{" "}
        <a
          href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          OSMF Privacy Policy
        </a>
        .
      </p>

      <h2>3b. Progressive Web App / Service Worker</h2>
      <p>
        JobFunke kann als App auf deinem Gerät installiert werden (PWA). Hierzu
        wird ein <strong>Service Worker</strong> registriert, der statische
        Inhalte lokal zwischenspeichert, um die Seite schneller und teilweise
        offline verfügbar zu machen. Dabei werden{" "}
        <strong>keine personenbezogenen Daten erhoben oder übertragen</strong>;
        Suchanfragen (<code>/api</code>) werden bewusst nicht im Cache abgelegt.
        Du kannst den Service-Worker-Cache jederzeit über die Einstellungen deines
        Browsers löschen.
      </p>

      <h2>4. Externe Schnittstellen: Arbeitnow, Jobicy und Remotive</h2>
      <p>
        Zur Bereitstellung der Stellenangebote nutzen wir die öffentlich
        zugänglichen APIs von Arbeitnow, Jobicy und Remotive. Beim
        Abruf von Stellendaten verbindet sich unser Server mit den Anbietern.
        Suchparameter werden intern auf den bereits abgerufenen Datensätzen
        angewendet. Es gelten ergänzend die Datenschutzhinweise der
        jeweiligen Anbieter.
      </p>

      <h2>5. Externe Links / Bewerbung</h2>
      <p>
        Wenn du auf „Zur Stelle“ bzw. „Jetzt bewerben“ klickst, wirst du auf die
        Website des inserierenden Unternehmens oder zum ursprünglichen Jobportal
        weitergeleitet. Für die dortige Datenverarbeitung sind ausschließlich die
        jeweiligen Betreiber verantwortlich.
      </p>

      <h2>6. Hosting</h2>
      <p>
        Die Website wird bei einem externen Dienstleister gehostet. Mit dem
        Hosting-Provider besteht – soweit erforderlich – ein
        Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Der Provider
        verarbeitet die genannten Server-Logfiles in unserem Auftrag.
      </p>

      <h2>7. Deine Rechte</h2>
      <p>Du hast nach der DSGVO insbesondere folgende Rechte:</p>
      <ul>
        <li>Auskunft über die zu deiner Person gespeicherten Daten (Art. 15)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16)</li>
        <li>Löschung (Art. 17) und Einschränkung der Verarbeitung (Art. 18)</li>
        <li>Datenübertragbarkeit (Art. 20)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21)</li>
        <li>
          Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77)
        </li>
      </ul>
      <p>
        Zur Wahrnehmung deiner Rechte genügt eine formlose E-Mail an{" "}
        <a href="mailto:markovolchkov32@gmail.com">markovolchkov32@gmail.com</a>.
      </p>

      <h2>8. Aktualität</h2>
      <p>
        Diese Datenschutzerklärung wird bei Bedarf angepasst, um sie an aktuelle
        rechtliche Anforderungen anzupassen. Es gilt die jeweils auf dieser Seite
        veröffentlichte Fassung.
      </p>
    </LegalShell>
  );
}
