# JobFunke — neue Datenquellen

Die Jobsuche nutzt jetzt **Arbeitnow + Jobicy + Remotive + Himalayas + Nomado24** statt der nicht für unabhängige Portale vorgesehenen Bundesagentur-Schnittstelle.

## APIs

| Anbieter | API | Server-Cache |
|---|---|---|
| Arbeitnow | `https://www.arbeitnow.com/api/job-board-api?page=1..8` | 30 Minuten |
| Jobicy | `https://jobicy.com/api/jobs?count=200&geo=germany/europe` | 1 Stunde |
| Remotive | `https://remotive.com/api/remote-jobs` | 6 Stunden |
| Himalayas | `https://himalayas.app/jobs/api/search?country=DE&page=1..5` | 24 Stunden |
| Nomado24 | `https://api.nomado24.de/api/public/v2/jobs?applicant_region=DE` (Cursor, bis zu 5 Seiten) | 1 Stunde |

Es sind **keine API-Schlüssel** erforderlich. Bei teilweisem Ausfall liefert JobFunke Treffer aus den funktionierenden Quellen und zeigt die nicht erreichbaren Anbieter an. Bei Ausfall aller fünf Quellen antwortet `/api/search` mit 502.

Die eingebundenen öffentlichen Feeds liefern **keine vollständige nationale Gesamtmenge**. Angezeigte Trefferzahlen beschreiben nur die aktuell geladenen Datensätze. Die Daten werden normalisiert, Quellen-IDs mit `an-`, `jy-`, `rm-`, `hm-` und `nm-` gekennzeichnet, offensichtliche Dubletten anhand von Unternehmen/Titel/Ort entfernt und in der Suche zusammengeführt. Es werden maximal acht Arbeitnow-Seiten, fünf Himalayas-Seiten und fünf Nomado24-Cursor-Seiten geladen. Remotive wird auf Positionen mit Deutschland-/Europa-/weltweiter Berechtigung gefiltert. Nomado24 wird für Bewerber aus Deutschland abgefragt.

Standortabfragen sind textbasiert; Remote-Stellen bleiben enthalten. **Kilometerradius, Entfernungs-Sortierung und Karten-Pins** sind deaktiviert, da die Feeds keine verlässlichen Koordinaten liefern. Filter für Vollzeit/Teilzeit, Vertragsdauer und Ausbildungs-/Minijob-Typen sind nur so vollständig wie die vorhandenen Anbieterfelder. Es gibt keine garantierte API-weite Suchpagination: paginiert wird der aktuell geladene Datenbestand.

Stellen-Details werden aus denselben Feeds abgerufen und für sechs Stunden im lokalen Prozessindex vorgehalten. Eine Stelle, die aus dem Feed gefallen ist, kann auf ihrer JobFunke-Detailseite nicht mehr verfügbar sein. Der ursprüngliche Anbieterlink bleibt in der gespeicherten Job-Karte erhalten. Bereits vor der Umstellung gespeicherte Bundesagentur-Stellen sind weiterhin im lokalen Favoritenspeicher, können aber nicht über die neuen Detail-APIs nachgeladen werden.

## Quelle und Links

- Arbeitnow verlangt einen Rücklink auf Arbeitnow: https://www.arbeitnow.com/terms
- Jobicy verlangt Quellenangabe und Verlinkung zur Jobicy-Stelle: https://jobicy.com/jobs-rss-feed
- Remotive verlangt Quellenangabe, Link zu Remotive und maßvolles Polling: https://remotive.com/remote-jobs/api
- Himalayas erlaubt die Anzeige auf eigenen Websites, verlangt sichtbare Quellenangabe und unveränderten `applicationLink`: https://himalayas.app/terms
- Nomado24 verlangt einen sichtbaren Link zurück: https://www.nomado24.de/en/developers

Jede Job-Karte zeigt den Anbieter. Job-Details öffnen dessen Originalanzeige und der Footer enthält Links zu allen fünf Quellen. Himalayas-Anzeigen dürfen nicht an Drittanbieter oder Job-Aggregatoren weitergegeben werden.

## Kostenloser Übersetzer

Auf der Detailseite schaltet `Original / Русский / Українська` zwischen Original und maschineller Übersetzung über **MyMemory**. Die Übersetzung beginnt erst nach dem Klick. Es werden nur Titel und die ersten **3400 Zeichen** der Beschreibung übertragen; längere Texte zeigen einen Hinweis. Technischer Cache und Browser-localStorage speichern das Ergebnis bis zu sieben Tage. Der Server-Cache ist auf Vercel nicht dauerhaft zwischen Instanzen geteilt.

MyMemory erlaubt derzeit **5000 Zeichen/Tag** ohne Registrierung oder **50000 Zeichen/Tag** mit gültiger Kontakt-E-Mail (siehe https://mymemory.translated.net/doc/usagelimits.php). Optional in Vercel `MYMEMORY_CONTACT_EMAIL` mit gültiger Adresse eintragen, um das höhere kostenlose Limit zu nutzen. Ohne diese Variable funktioniert das kleinere kostenlose Kontingent. Bei Überschreitung wird eine Fehlermeldung angezeigt, der Originaltext bleibt zugänglich. Ausgangssprache (Deutsch/Englisch) wird heuristisch erkannt, Qualität kann variieren.

## Bereitstellung

Keine zusätzlichen Secrets für die Stellen-APIs nötig. Das Google-Login benötigt weiterhin die Supabase-Konfiguration gemäß `SETUP-KONTO.md`.

Nach Deployment in Vercel prüfen:

1. `/api/search?size=10` liefert `jobs`, `total` und optional `unavailable`.
2. Suche nach Beruf + Ort, Öffnen einer Stelle, externer Bewerbungslink.
3. Sichern/Entfernen in der Merkliste, Login/Logout und Synchronisierung.
4. In Vercel Logs kontrollieren, ob einzelne Provider dauerhaft HTTP 429/403 zurückgeben.
5. Angaben in Datenschutz/Impressum durch eine für deine konkrete Bereitstellung qualifizierte Person prüfen, insbesondere Google und Supabase.
