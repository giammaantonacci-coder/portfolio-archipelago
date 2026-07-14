'use client';

import dynamic from 'next/dynamic';
import { MapPinned, CircleParking, Flag } from 'lucide-react';
import type { Coordinates } from '@/types';
import { useDemoMap } from '@/lib/config';

/** La mappa interattiva (MapLibre) è caricata solo lato client. */
const InteractiveMap = dynamic(() => import('./interactive-map'), {
  ssr: false,
  loading: () => <div className="skeleton h-44 w-full rounded-3xl" aria-hidden />,
});

interface RouteMapProps {
  origin?: Coordinates;
  parking: Coordinates;
  destination: Coordinates;
}

/**
 * Mappa del percorso. In modalità demo mostra un placeholder elegante senza
 * dipendenze di rete; altrimenti una mappa interattiva reale (OSM/MapLibre,
 * o Mapbox se configurato).
 */
export function RouteMap({ origin, parking, destination }: RouteMapProps) {
  if (!useDemoMap) {
    return <InteractiveMap origin={origin} parking={parking} destination={destination} />;
  }
  return <DemoMapPlaceholder />;
}

function DemoMapPlaceholder() {
  return (
    <div
      className="relative h-44 w-full overflow-hidden rounded-3xl border border-border bg-blue-soft"
      role="img"
      aria-label="Anteprima del percorso: partenza, parcheggio e destinazione"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(103,84,244,.12) 25%, rgba(103,84,244,.12) 26%, transparent 27%, transparent 74%, rgba(103,84,244,.12) 75%, rgba(103,84,244,.12) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(103,84,244,.12) 25%, rgba(103,84,244,.12) 26%, transparent 27%, transparent 74%, rgba(103,84,244,.12) 75%, rgba(103,84,244,.12) 76%, transparent 77%)',
          backgroundSize: '32px 32px',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M12 46 C 30 40, 40 30, 52 30"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="0.5 3"
        />
        <path
          d="M52 30 C 62 30, 72 20, 86 14"
          fill="none"
          stroke="var(--green)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="0.5 3"
        />
      </svg>
      <Marker
        className="left-[8%] top-[70%]"
        tone="text-primary"
        icon={MapPinned}
        label="Partenza"
      />
      <Marker
        className="left-[48%] top-[45%]"
        tone="text-primary"
        icon={CircleParking}
        label="Parcheggio"
      />
      <Marker className="left-[82%] top-[16%]" tone="text-green" icon={Flag} label="Destinazione" />
    </div>
  );
}

function Marker({
  className,
  tone,
  icon: Icon,
  label,
}: {
  className: string;
  tone: string;
  icon: typeof Flag;
  label: string;
}) {
  return (
    <div className={`absolute -translate-x-1/2 -translate-y-1/2 ${className}`}>
      <div className="flex flex-col items-center gap-1">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-soft ${tone}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="bg-surface/90 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
          {label}
        </span>
      </div>
    </div>
  );
}
