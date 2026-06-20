"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MatchResult } from "@/lib/matching/types";

const HIGHLIGHT_SOURCE_ID = "selected-neighborhood-highlight";
const HIGHLIGHT_FILL_LAYER_ID = "selected-neighborhood-highlight-fill";
const HIGHLIGHT_RING_LAYER_ID = "selected-neighborhood-highlight-ring";

interface MapViewProps {
  matches: MatchResult[];
  places: Array<{
    id: string;
    name: string;
    category: "food" | "nightlife" | "wellness" | "practical";
    lat?: number;
    lng?: number;
  }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: [number, number]; // [lng, lat]
}

const PLACE_CATEGORY_STYLE = {
  food: {
    label: "Food",
    color: "#F59E0B",
  },
  nightlife: {
    label: "Nightlife",
    color: "#E11D48",
  },
  wellness: {
    label: "Wellness",
    color: "#10B981",
  },
  practical: {
    label: "Daily",
    color: "#14B8A6",
  },
} as const;

export default function MapView({ matches, places, selectedId, onSelect, center }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const initialCenter = useRef(center);
  const lastCenter = useRef<[number, number] | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const placeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const selectedAreaMarkerRef = useRef<maplibregl.Marker | null>(null);

  const selectedMatch = matches.find((match) => match.neighborhoodId === selectedId);

  const ensureHighlightLayers = (currentMap: maplibregl.Map) => {
    if (!currentMap.getSource(HIGHLIGHT_SOURCE_ID)) {
      currentMap.addSource(HIGHLIGHT_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }

    if (!currentMap.getLayer(HIGHLIGHT_FILL_LAYER_ID)) {
      currentMap.addLayer({
        id: HIGHLIGHT_FILL_LAYER_ID,
        type: "circle",
        source: HIGHLIGHT_SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            34,
            12,
            72,
            14,
            150,
          ],
          "circle-color": "#2563EB",
          "circle-opacity": 0.14,
          "circle-stroke-color": "#2563EB",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.35,
        },
      });
    }

    if (!currentMap.getLayer(HIGHLIGHT_RING_LAYER_ID)) {
      currentMap.addLayer({
        id: HIGHLIGHT_RING_LAYER_ID,
        type: "circle",
        source: HIGHLIGHT_SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            38,
            12,
            82,
            14,
            170,
          ],
          "circle-color": "transparent",
          "circle-stroke-color": "#E8C547",
          "circle-stroke-width": 3,
          "circle-stroke-opacity": 0.85,
        },
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: initialCenter.current,
      zoom: 12,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      if (map.current) {
        selectedAreaMarkerRef.current?.remove();
        placeMarkersRef.current.forEach((marker) => marker.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (!map.current) return;

    if (
      lastCenter.current &&
      lastCenter.current[0] === center[0] &&
      lastCenter.current[1] === center[1]
    ) {
      return;
    }

    lastCenter.current = center;
    map.current.easeTo({
      center: center,
      zoom: map.current.getZoom() > 11 ? map.current.getZoom() : 12,
      duration: 650,
    });
  }, [center]);

  // Highlight selected neighborhood as an approximate area around its center.
  useEffect(() => {
    if (!map.current) return;

    const currentMap = map.current;

    selectedAreaMarkerRef.current?.remove();
    selectedAreaMarkerRef.current = null;

    if (selectedMatch) {
      const areaEl = document.createElement("div");
      areaEl.className =
        "pointer-events-none h-44 w-44 rounded-full border-[3px] border-amber-400/90 bg-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.35)]";
      areaEl.style.zIndex = "1";

      selectedAreaMarkerRef.current = new maplibregl.Marker({
        element: areaEl,
        anchor: "center",
      })
        .setLngLat([selectedMatch.lng, selectedMatch.lat])
        .addTo(currentMap);
    }

    const updateHighlight = () => {
      ensureHighlightLayers(currentMap);
      const source = currentMap.getSource(HIGHLIGHT_SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;
      if (!source) return;

      source.setData({
        type: "FeatureCollection",
        features: selectedMatch
          ? [
              {
                type: "Feature",
                properties: {
                  id: selectedMatch.neighborhoodId,
                  name: selectedMatch.neighborhoodName,
                },
                geometry: {
                  type: "Point",
                  coordinates: [selectedMatch.lng, selectedMatch.lat],
                },
              },
            ]
          : [],
      });
    };

    if (currentMap.isStyleLoaded()) {
      updateHighlight();
      return;
    }

    currentMap.once("load", updateHighlight);

    return () => {
      selectedAreaMarkerRef.current?.remove();
      selectedAreaMarkerRef.current = null;
    };
  }, [selectedMatch]);

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
      el.style.zIndex = match.neighborhoodId === selectedId ? "30" : "10";
      
      const scoreSpan = document.createElement("span");
      scoreSpan.className = `text-[13px] ${textClass}`;
      scoreSpan.innerText = `${match.score}%`;
      el.appendChild(scoreSpan);

      // Tooltip/Label element
      const labelEl = document.createElement("div");
      labelEl.className = `absolute -top-8 bg-white/95 backdrop-blur border border-slate-200 text-[11px] text-slate-700 px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap transition-opacity duration-200 ${
        match.neighborhoodId === selectedId ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`;
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

  // Update nearby place markers for the selected neighborhood.
  useEffect(() => {
    if (!map.current) return;

    const currentMap = map.current;

    placeMarkersRef.current.forEach((marker) => marker.remove());
    placeMarkersRef.current = [];

    places
      .filter((place) => typeof place.lat === "number" && typeof place.lng === "number")
      .slice(0, 30)
      .forEach((place) => {
        const style = PLACE_CATEGORY_STYLE[place.category];
        const el = document.createElement("div");
        el.className =
          "group relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-[0_5px_14px_rgba(15,23,42,0.2)] transition-transform hover:scale-125";
        el.style.backgroundColor = style.color;
        el.style.zIndex = "25";

        const dot = document.createElement("span");
        dot.className = "h-1.5 w-1.5 rounded-full bg-white";
        el.appendChild(dot);

        const labelEl = document.createElement("div");
        labelEl.className =
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100";
        labelEl.innerText = place.name;
        el.appendChild(labelEl);

        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([place.lng as number, place.lat as number])
          .addTo(currentMap);

        placeMarkersRef.current.push(marker);
      });
  }, [places]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 text-[11px] text-slate-600 shadow-soft-sm backdrop-blur">
        <div className="mb-1.5 font-bold text-slate-900">Map</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-blue-500/30" />
            <span>Area</span>
          </div>
          {Object.entries(PLACE_CATEGORY_STYLE).map(([category, style]) => (
            <div key={category} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full border border-white shadow"
                style={{ backgroundColor: style.color }}
              />
              <span>{style.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
