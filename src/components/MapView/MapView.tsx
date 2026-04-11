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

    import("leaflet").then(async (L) => {
      if (controller.signal.aborted || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const res = await fetch(
        `https://api.mapy.cz/v1/geocode?query=${encodeURIComponent(clinic.address)}&lang=cs&apikey=${process.env.NEXT_PUBLIC_MAPYCZ_KEY}`,
        { signal: controller.signal }
      ).catch(() => null);

      if (!res || controller.signal.aborted || !containerRef.current) return;

      const data = await res.json();
      const item = data.items?.[0];
      if (!item || controller.signal.aborted || !containerRef.current) return;

      const { lat, lon } = item.position;

      const photoUrl = clinic.photoUrl || '/Icon clinics.png';
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: linear-gradient(135deg, #622ADA, #0070BB);
          border-radius: 50%;
          width: 46px;
          height: 46px;
          padding: 2.5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        ">
          <img src="${photoUrl}" style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            background: #ede9ff;
          " />
        </div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 46],
      });


      mapRef.current = L.map(containerRef.current).setView([lat, lon], 15);

    L.tileLayer(
      "https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
      {
        attribution: "© JawgMaps © OpenStreetMap",
        accessToken: process.env.NEXT_PUBLIC_JAWG_TOKEN,
      } as L.TileLayerOptions & { accessToken: string }
    ).addTo(mapRef.current);





      L.marker([lat, lon], { icon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${clinic.name}</b><br/>${clinic.address}`, { offset: [0, -50] })
        .openPopup();
    });

    return () => {
      controller.abort();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [clinic.id, clinic.address]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-2 text-sm text-gray-500">{clinic.address}</div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: "400px",
          filter: "saturate(0.9) brightness(0.88) contrast(1.05)",
        }}
      />
    </div>
  );
}
