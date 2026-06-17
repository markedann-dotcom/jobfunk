"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import type { JobListItem } from "@/lib/api";

export function JobsMap({ jobs }: { jobs: JobListItem[] }) {
  const { t } = useT();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const pinned = useMemo(
    () =>
      jobs.filter(
        (j) =>
          typeof j.lat === "number" &&
          typeof j.lon === "number" &&
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
      await import("leaflet/dist/leaflet.css");

      // Исправление стандартных иконок Leaflet в Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (cancelled || !elRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(elRef.current, { scrollWheelZoom: false }).setView([51.1657, 10.4515], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
        layerRef.current = L.featureGroup().addTo(mapRef.current);
      }

      const layer = layerRef.current!;
      layer.clearLayers();

      const icon = L.divIcon({
        className: "jf-pin-container",
        html: `<div class="jf-pin-dot"></div>`,
        iconSize: [24, 24],
      });

      pinned.forEach((j) => {
        const marker = L.marker([j.lat!, j.lon!], { icon }).addTo(layer);
        marker.bindPopup(`
          <div class="jf-popup">
             <strong style="display:block;margin-bottom:4px;">${escapeHtml(j.titel)}</strong>
             <span style="color:#6b6259;font-size:12px;">${escapeHtml(j.arbeitgeber || "")}</span><br/>
             <a href="/job/${encodeURIComponent(j.refnr)}" style="display:inline-block;margin-top:6px;color:#ea580c;font-weight:700;">${t("map.open")} →</a>
          </div>
        `);
      });

      if (pinned.length > 0) {
        mapRef.current.fitBounds(layer.getBounds().pad(0.25), { maxZoom: 10 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pinned, t]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
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
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-ink">
          {pinned.length} {t("map.pins")}
        </p>
        <Link href="#results" className="text-xs font-bold text-accent hover:underline">
          {t("map.tolist")}
        </Link>
      </div>
      <div ref={elRef} className="h-[420px] w-full z-0" />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]!));
}
