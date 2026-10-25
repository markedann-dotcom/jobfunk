# JobFunke — neue Datenquellen

Die Jobsuche nutzt jetzt **Arbeitnow + Jobicy + Remotive** statt der nicht für unabhängige Portale vorgesehenen Bundesagentur-Schnittstelle.

## APIs

| Anbieter | API | Server-Cache |
|---|---|---|
| Arbeitnow | `https://www.arbeitnow.com/api/job-board-api?page=1..3` | 30 Minuten |
| Jobicy | `https://jobicy.com/api/jobs?count=200&geo=germany/europe` | 1 Stunde |
| Remotive | `https://remotive.com/api/remote-jobs` | 6 Stunden |

Es sind **keine API-Schlüssel** erforderlich. Bei teilweisem Ausfall liefert JobFunke Treffer aus den funktionierenden Quellen und zeigt die nicht erreichbaren Anbieter an. Bei Ausfall aller drei Quellen antwortet `/api/search` mit 502.

Die eingebundenen öffentlichen Feeds liefern **keine vollständige nationale Gesamtmenge**. Angezeigte Trefferzahlen beschreiben nur die aktuell geladenen Datensätze. Die Daten werden normalisiert, Quellen-IDs mit `an-`, `jy-` und `rm-` gekennzeichnet und in der Suchausgabe zusammengeführt. Es werden pro Abruf höchstens drei Arbeitnow-Seiten sowie je eine Jobicy-Seite für Deutschland und Europa geladen. Remotive wird auf Positionen mit Deutschland-/Europa-/weltweiter Berechtigung gefiltert.

Standortabfragen sind textbasiert; Remote-Stellen bleiben enthalten. **Kilometerradius, Entfernungs-Sortierung und Karten-Pins** sind deaktiviert, da die Feeds keine verlässlichen Koordinaten liefern. Filter für Vollzeit/Teilzeit, Vertragsdauer und Ausbildungs-/Minijob-Typen sind nur so vollständig wie die vorhandenen Anbieterfelder. Es gibt keine garantierte API-weite Suchpagination: paginiert wird der aktuell geladene Datenbestand.

Stellen-Details werden aus denselben Feeds abgerufen und für sechs Stunden im lokalen Prozessindex vorgehalten. Eine Stelle, die aus dem Feed gefallen ist, kann auf ihrer JobFunke-Detailseite nicht mehr verfügbar sein. Der ursprüngliche Anbieterlink bleibt in der gespeicherten Job-Karte erhalten. Bereits vor der Umstellung gespeicherte Bundesagentur-Stellen sind weiterhin im lokalen Favoritenspeicher, können aber nicht über die neuen Detail-APIs nachgeladen werden.

## Quelle und Links

- Arbeitnow verlangt einen Rücklink auf Arbeitnow: https://www.arbeitnow.com/terms
- Jobicy verlangt Quellenangabe und Verlinkung zur Jobicy-Stelle: https://jobicy.com/jobs-rss-feed
- Remotive verlangt Quellenangabe, Link zu Remotive und maßvolles Polling: https://remotive.com/remote-jobs/api

Jede Job-Karte zeigt den Anbieter. Job-Details öffnen dessen Originalanzeige und der Footer enthält Links zu allen drei Quellen. Jobicy- und Remotive-Remoteanzeigen sollten nicht auf andere Jobbörsen syndiziert werden.

## Bereitstellung

Keine zusätzlichen Secrets für die Stellen-APIs nötig. Das Google-Login benötigt weiterhin die Supabase-Konfiguration gemäß `SETUP-KONTO.md`.

Nach Deployment in Vercel prüfen:

1. `/api/search?size=10` liefert `jobs`, `total` und optional `unavailable`.
2. Suche nach Beruf + Ort, Öffnen einer Stelle, externer Bewerbungslink.
3. Sichern/Entfernen in der Merkliste, Login/Logout und Synchronisierung.
4. In Vercel Logs kontrollieren, ob einzelne Provider dauerhaft HTTP 429/403 zurückgeben.
5. Angaben in Datenschutz/Impressum durch eine für deine konkrete Bereitstellung qualifizierte Person prüfen, insbesondere Google und Supabase.
