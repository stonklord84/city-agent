"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MatchResult } from "@/lib/matching/types";

interface MapViewProps {
  matches: MatchResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: [number, number]; // [lng, lat]
}

export default function MapView({ matches, selectedId, onSelect, center }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: center,
      zoom: 12,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center]);

  // Update map center when it changes
  useEffect(() => {
    if (!map.current) return;
    map.current.easeTo({
      center: center,
      zoom: map.current.getZoom() > 11 ? map.current.getZoom() : 12,
      duration: 1200,
    });
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    const currentMap = map.current;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    // Create new markers
    matches.forEach((match) => {
      // Color scale based on match %
      let colorClass = "bg-slate-200 border-slate-300";
      let textClass = "text-slate-600";
      let scaleClass = "scale-90 opacity-60";

      if (match.score >= 90) {
        colorClass = "bg-blue-600 border-blue-400 ring-4 ring-blue-500/20";
        textClass = "text-white font-bold";
        scaleClass = "scale-110 z-10 opacity-100 shadow-lg shadow-blue-500/20";
      } else if (match.score >= 70) {
        colorClass = "bg-white border-slate-300 ring-2 ring-slate-200";
        textClass = "text-slate-900 font-semibold";
        scaleClass = "scale-100 z-5 opacity-90";
      }

      if (match.neighborhoodId === selectedId) {
        colorClass = "bg-blue-700 border-blue-300 ring-4 ring-blue-500/30";
        textClass = "text-white font-black";
        scaleClass = "scale-125 z-20 opacity-100 shadow-xl shadow-blue-500/30";
      }

      // Create HTML Element for Marker
      const el = document.createElement("div");
      el.className = `flex items-center justify-center rounded-full border-2 w-10 h-10 cursor-pointer transition-all duration-300 ${colorClass} ${scaleClass}`;
      
      const scoreSpan = document.createElement("span");
      scoreSpan.className = `text-[13px] ${textClass}`;
      scoreSpan.innerText = `${match.score}%`;
      el.appendChild(scoreSpan);

      // Tooltip/Label element
      const labelEl = document.createElement("div");
      labelEl.className = "absolute -top-8 bg-white/95 backdrop-blur border border-slate-200 text-[11px] text-slate-700 px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200";
      labelEl.innerText = match.neighborhoodName;
      el.appendChild(labelEl);
      el.classList.add("group");

      el.addEventListener("click", () => {
        onSelect(match.neighborhoodId);
      });

      // Add to map
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([match.lng, match.lat])
        .addTo(currentMap);

      markersRef.current[match.neighborhoodId] = marker;
    });
  }, [matches, selectedId, onSelect]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
