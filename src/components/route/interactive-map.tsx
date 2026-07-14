'use client';

import * as React from 'react';
import maplibregl, { type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Coordinates } from '@/types';
import { appConfig, useMapbox } from '@/lib/config';

interface InteractiveMapProps {
  origin?: Coordinates;
  parking: Coordinates;
  destination: Coordinates;
}

/** Stile raster basato su tile OpenStreetMap (nessuna chiave richiesta). */
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

/** Con Mapbox configurato usiamo un suo stile vettoriale, altrimenti OSM raster. */
function resolveStyle(): string | StyleSpecification {
  if (useMapbox) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${appConfig.mapboxToken}`;
  }
  return OSM_STYLE;
}

function makeMarker(color: string, label: string): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('aria-label', label);
  el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
  return el;
}

export default function InteractiveMap({ origin, parking, destination }: InteractiveMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: resolveStyle(),
      center: [parking.longitude, parking.latitude],
      zoom: 13,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.scrollZoom.disable();

    const points: Array<{ c: Coordinates; color: string; label: string }> = [
      { c: parking, color: '#6754F4', label: 'Parcheggio' },
      { c: destination, color: '#45C97A', label: 'Destinazione' },
    ];
    if (origin) points.unshift({ c: origin, color: '#17182E', label: 'Partenza' });

    for (const p of points) {
      new maplibregl.Marker({ element: makeMarker(p.color, p.label) })
        .setLngLat([p.c.longitude, p.c.latitude])
        .setPopup(new maplibregl.Popup({ offset: 16 }).setText(p.label))
        .addTo(map);
    }

    const bounds = new maplibregl.LngLatBounds();
    points.forEach((p) => bounds.extend([p.c.longitude, p.c.latitude]));

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: points.map((p) => [p.c.longitude, p.c.latitude]),
          },
        },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#6754F4', 'line-width': 3, 'line-dasharray': [1.5, 1.5] },
      });
      map.fitBounds(bounds, { padding: 48, maxZoom: 15, animate: !reduceMotion });
    });

    return () => map.remove();
  }, [origin, parking, destination]);

  return (
    <div
      ref={containerRef}
      className="h-44 w-full overflow-hidden rounded-3xl border border-border"
      role="img"
      aria-label="Mappa del percorso: partenza, parcheggio e destinazione"
    />
  );
}
