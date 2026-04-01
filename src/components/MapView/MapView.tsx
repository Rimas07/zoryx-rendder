"use client";

import { useEffect, useRef } from "react";
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
      await import("leaflet/dist/leaflet.css" as never);

      if (controller.signal.aborted || !containerRef.current) return;

      // убираем старую карту если есть
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

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      mapRef.current = L.map(containerRef.current).setView([lat, lon], 15);

      L.tileLayer(
        `https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${process.env.NEXT_PUBLIC_MAPYCZ_KEY}`,
        { attribution: '© <a href="https://mapy.cz">Mapy.cz</a>' }
      ).addTo(mapRef.current);

      L.marker([lat, lon], { icon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${clinic.name}</b><br/>${clinic.address}`)
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
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
