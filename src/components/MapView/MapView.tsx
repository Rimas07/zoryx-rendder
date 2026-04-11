"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Clinic } from "../../types/clinic";

interface Props {
  clinic: Clinic;
}

export function MapView({ clinic }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!clinic.address || !containerRef.current) return;

    const controller = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];

    import("leaflet").then(async (L) => {
      if (controller.signal.aborted) return;

      const res = await fetch(
        `https://api.mapy.cz/v1/geocode?query=${encodeURIComponent(clinic.address)}&lang=cs&apikey=${process.env.NEXT_PUBLIC_MAPYCZ_KEY}`,
        { signal: controller.signal }
      ).catch(() => null);

      if (!res || controller.signal.aborted || !containerRef.current) return;

      const data = await res.json();
      const item = data.items?.[0];
      if (!item || controller.signal.aborted || !containerRef.current) return;

      const { lat, lon } = item.position;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const photoUrl = clinic.photoUrl || '/Icon clinics.png';
      const icon = L.divIcon({
        className: "",
        html: `<style>
          @keyframes markerDrop {
            0%   { transform: translateY(-28px) scale(0.65); opacity: 0; }
            70%  { transform: translateY(4px) scale(1.08); opacity: 1; }
            85%  { transform: translateY(-6px) scale(0.97); }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
        </style>
        <div style="
          background: linear-gradient(135deg, #622ADA, #0070BB);
          border-radius: 50%; width: 46px; height: 46px; padding: 2.5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          animation: markerDrop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        ">
          <img src="${photoUrl}" style="
            width: 100%; height: 100%; border-radius: 50%;
            object-fit: cover; display: block; background: #ede9ff;
          " />
        </div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });

      mapRef.current = L.map(containerRef.current, {
        zoomControl: true,
        center: [lat, lon],
        zoom: 15,
      });

      L.tileLayer(
        "https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
        {
          attribution: "© JawgMaps © OpenStreetMap",
          accessToken: process.env.NEXT_PUBLIC_JAWG_TOKEN,
        } as L.TileLayerOptions & { accessToken: string }
      ).addTo(mapRef.current);

      L.marker([lat, lon], { icon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${clinic.name}</b><br/>${clinic.address}`, { offset: [0, -25], autoPan: false })
        .openPopup();

      // Многократно пересчитываем размер и центр — чтобы поймать момент
      // после завершения 3D flip анимации (700ms)
      [0, 200, 500, 800, 1100].forEach((delay) => {
        const t = setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.invalidateSize({ animate: false });
          mapRef.current.setView([lat, lon], 15, { animate: false });
        }, delay);
        timers.push(t);
      });
    });

    return () => {
      timers.forEach(clearTimeout);
      controller.abort();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [clinic.id, clinic.address]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        minHeight: "400px",
        filter: "saturate(0.9) brightness(0.88) contrast(1.05)",
      }}
    />
  );
}
