# JobFunke — Finaler Audit & Security-Härtung

Datum: 2026-06-18

## Security — neu hinzugefügt
- **Rate Limiting** (`src/lib/rate-limit.ts`) — In-Memory Sliding Window auf allen API-Routen:
  - `/api/search` 40/min · `/api/job/[refnr]` 60/min · `/api/job/[refnr]/similar` 40/min
  - `/api/suggest` 90/min · `/api/jobs/count` 30/min
  - Antwortet mit `429` + `Retry-After` + `X-RateLimit-*` Headern. Verifiziert: 429 nach 40 Requests.
- **CSP verschärft** (`next.config.ts`):
  - `img-src` + `connect-src` explizit für OpenStreetMap-Tiles + Cloudflare-CDN (Leaflet-Marker)
  - Neu: `worker-src 'self' blob:`, `media-src 'self'`, `frame-src 'none'`
- **Cross-Origin-Härtung**: `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `X-Permitted-Cross-Domain-Policies: none`, `Origin-Agent-Cluster: ?1`
- **API-spezifische Header**: `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `nosniff`, `CORP same-origin` für alle `/api/*`
- **count-Route bereinigt**: kein `console.error`-Leak mehr, kein Error-Detail-Leak (502), Cache-Control.

## Security — bereits vorhanden (verifiziert)
- HSTS preload, X-Frame-Options SAMEORIGIN, nosniff, Permissions-Policy, X-DNS-Prefetch-Control, poweredByHeader:false.
- Input-Validierung auf allen Routen: `clean()` (Trim/Cap/Control-Chars), `intIn()` Clamp, Allowlist-Sets (angebotsart/sort/befristung/arbeitszeit), refnr-Regex + Längenbegrenzung.
- Keine Error-Leaks an Client (`upstream_unavailable` / `bad_request` nur).
- Public API-Key (Bundesagentur) nur serverseitig, kein Secret.
- localStorage sanitized; kein `dangerouslySetInnerHTML`; Links nur `https?://` + `rel=noopener`.

## Funktionaler Audit (PASS)
- Build sauber (17 Routen), 0 Console-Errors auf /, /suche, /netto-rechner, /ratgeber.
- Rate-Limit: 429 nach Limit, Reset nach 60s verifiziert.
- Eingabe-Härtung: `size=99999&page=-5` → 200 geclampt; ungültige refnr → 400/abgewiesen; kein Message-Leak.
- Karte: OSM-Tiles laden trotz strenger CSP (visuell verifiziert).
- Karten-Tiles, Google Fonts, PWA-Manifest, Service Worker — alle CSP-konform.

## Hinweis Rate-Limiting auf Serverless (Vercel)
In-Memory-Limit gilt pro warmer Instanz. Für harte globale Grenzen wäre ein externer Store (z.B. Upstash Redis) nötig — bewusst dependency-frei gehalten; bremst Burst-Missbrauch bereits wirksam.
