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

     const icon = L.divIcon({
       className: "",
       html: `<div style="
    background: linear-gradient(135deg, #622ADA, #0070BB);
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'>
      <path d='M12 10h.01M12 14h.01M12 6h.01M16 10h.01M16 14h.01M16 6h.01M8 10h.01M8 14h.01M8 6h.01M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3'/>
      <rect width='16' height='20' x='4' y='2' rx='2'/>
    </svg>
  </div>`,
       iconSize: [40, 40],
       iconAnchor: [20, 40],
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
        .bindPopup(`<b>${clinic.name}</b><br/>${clinic.address}`, { offset: [0, -45] })
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
