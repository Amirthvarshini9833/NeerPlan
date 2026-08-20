"use client";

import { useEffect, useRef, useState } from "react";
import { hasSelfIntersection, polygonAreaSqFt, type GeoPoint } from "@/lib/geo";

type Place = { id: number; name: string; latitude: number; longitude: number; type: string };
export type AreaSelection = { areaSqFt: number; source: string; sourceUrl: string; location?: string };
type Props = { initialQuery: string; onAreaChange: (selection: AreaSelection | null) => void; onLocationChange: (location: string) => void };
const defaultCenter = { latitude: 12.97194, longitude: 77.59369 };
const sourceUrl = "https://www.openstreetmap.org/copyright";
const format = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export function RooftopMapPicker({ initialQuery, onAreaChange, onLocationChange }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [area, setArea] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [places, setPlaces] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapElement.current || mapInstance.current) return;
      const map = L.map(mapElement.current).setView([defaultCenter.latitude, defaultCenter.longitude], 12);
      const normal = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 19 });
      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics", maxZoom: 19 });
      const terrain = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap", maxZoom: 17 });
      normal.addTo(map);
      L.control.layers({ Normal: normal, Satellite: satellite, Terrain: terrain }, undefined, { collapsed: false }).addTo(map);
      const layers = L.layerGroup().addTo(map);
      map.on("click", (event) => setPoints((current) => {
        if (current.length >= 12) { setMessage("Use at most 12 boundary points."); return current; }
        setMessage(""); return [...current, { latitude: event.latlng.lat, longitude: event.latlng.lng }];
      }));
      mapInstance.current = map; layerRef.current = layers;
      window.setTimeout(() => map.invalidateSize(), 0);
    });
    return () => { cancelled = true; mapInstance.current?.remove(); mapInstance.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const nextArea = polygonAreaSqFt(points);
    setArea(nextArea);
    const invalid = points.length < 3 ? "Add at least 3 points to close the rooftop boundary." : hasSelfIntersection(points) ? "Boundary lines cannot cross. Drag a point or clear the shape." : nextArea < 20 ? "The drawn area must be at least 20 sq ft." : nextArea > 100000 ? "The drawn area must be no more than 100,000 sq ft." : "";
    setMessage(invalid);
    onAreaChange(invalid ? null : { areaSqFt: Math.round(nextArea), source: "OpenStreetMap map + user-drawn rooftop boundary", sourceUrl });
    const layers = layerRef.current;
    if (!layers) return;
    import("leaflet").then((L) => {
      layers.clearLayers();
      points.forEach((point, index) => {
        const marker = L.marker([point.latitude, point.longitude], { draggable: true }).addTo(layers);
        marker.on("dragend", () => { const position = marker.getLatLng(); setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? { latitude: position.lat, longitude: position.lng } : item)); });
      });
      if (points.length >= 2) L.polygon(points.map((point) => [point.latitude, point.longitude] as [number, number]), { color: "#153b3a", fillColor: "#9dd8bd", fillOpacity: 0.35 }).addTo(layers);
    });
  }, [points]);

  async function search() {
    if (query.trim().length < 2) { setMessage("Enter at least two characters to search."); return; }
    setSearching(true); setMessage("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Location search is unavailable.");
      setPlaces(data); if (!data.length) setMessage("No Indian locations matched. You can still draw on the map or enter area manually.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Location search is unavailable."); } finally { setSearching(false); }
  }

  function selectPlace(place: Place) {
    mapInstance.current?.setView([place.latitude, place.longitude], 18);
    setPlaces([]); setQuery(place.name.split(",")[0]); setPoints([]); setArea(0); onAreaChange(null); onLocationChange(place.name.split(",").slice(0, 2).join(", "));
  }

  function clear() { setPoints([]); setArea(0); onAreaChange(null); setMessage("Add points by clicking around the rooftop. Drag any point to adjust it."); }

  return <section className="rooftop-picker" aria-labelledby="rooftop-map-heading">
    <div className="rooftop-picker-heading"><div><p className="eyebrow">OPTIONAL MAP INPUT</p><h3 id="rooftop-map-heading">Draw your rooftop boundary.</h3><p>Search for a place, then click around the roof on the map. Drag markers to adjust the shape.</p></div><div className="rooftop-area-readout"><span>Drawn area</span><strong>{area >= 1 ? `${format(area)} sq ft` : "—"}</strong></div></div>
    <div className="map-search"><label className="sr-only" htmlFor="map-location-search">Search map location</label><input id="map-location-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an Indian city or address" /><button type="button" className="secondary-button" disabled={searching} onClick={search}>{searching ? "Searching…" : "Search"}</button></div>
    {places.length > 0 && <ul className="map-results" data-no-translate>{places.map((place) => <li key={place.id}><button type="button" onClick={() => selectPlace(place)}>{place.name}</button></li>)}</ul>}
    <div ref={mapElement} className="rooftop-map" role="application" aria-label="OpenStreetMap rooftop drawing map" />
    <div className="map-toolbar"><button type="button" className="secondary-button" onClick={clear}>Clear boundary</button><span>Click 3–12 points. Minimum 20 sq ft, maximum 100,000 sq ft.</span></div>
    {message && <p className="form-message" role="status">{message}</p>}
    <p className="map-attribution">Use the layer switcher for Normal, Satellite, or Terrain views. Satellite imagery © Esri; map data © <a href={sourceUrl} target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Area is an estimate based on your drawn boundary.</p>
  </section>;
}
