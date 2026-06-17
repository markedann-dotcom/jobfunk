"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";
import { useT } from "@/lib/i18n";
import type { JobListItem } from "@/lib/api";

export function JobsMap({ jobs }: { jobs: JobListItem[] }) {
  const { t } = useT();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);

  const pinned = useMemo(
    () =>
      jobs.filter(
        (j) =>
          typeof j.lat === "number" &&
          typeof j.lon === "number" &&
          // drop missing/placeholder (0,0) and anything well outside Germany's bbox
          j.lat >= 47 &&
          j.lat <= 55.2 &&
          j.lon >= 5.5 &&
          j.lon <= 15.5
      ),
    [jobs]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(elRef.current, {
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView([51.1657, 10.4515], 6); // center of Germany
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-Mitwirkende',
          maxZoom: 18,
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const layer = layerRef.current!;
      layer.clearLayers();

      const icon = L.divIcon({
        className: "jf-pin",
        html: `<span class="jf-pin-dot"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const markers: Marker[] = [];
      for (const j of pinned) {
        const m = L.marker([j.lat as number, j.lon as number], { icon }).bindPopup(
          `<div style="font-family:system-ui;min-width:160px">
             <strong style="display:block;font-size:13px;color:#1c1714;line-height:1.3">${escapeHtml(
               j.titel
             )}</strong>
             ${j.arbeitgeber ? `<span style="font-size:12px;color:#6b6259">${escapeHtml(j.arbeitgeber)}</span><br/>` : ""}
             <span style="font-size:12px;color:#6b6259">${escapeHtml([j.plz, j.ort].filter(Boolean).join(" "))}</span><br/>
             <a href="/job/${encodeURIComponent(j.refnr)}" style="display:inline-block;margin-top:6px;font-size:12px;font-weight:700;color:#ea580c;text-decoration:none">${escapeHtml(
               t("map.open")
             )} →</a>
           </div>`
        );
        m.addTo(layer);
        markers.push(m);
      }

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        mapRef.current!.fitBounds(group.getBounds().pad(0.25), { maxZoom: 11 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pinned, t]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (pinned.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <p className="text-sm text-muted">{t("map.none")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_12px_-4px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <p className="text-sm font-semibold text-ink">
          {pinned.length} {t("map.pins")}
        </p>
        <Link href="#results" className="text-xs font-bold text-accent hover:text-accent-strong">
          {t("map.tolist")}
        </Link>
      </div>
      <div ref={elRef} className="h-[420px] w-full" />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
