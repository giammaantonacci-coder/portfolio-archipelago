import { MapPin, CircleParking, Flag, Car, Footprints } from 'lucide-react';
import type { Parking, SearchPreferences } from '@/types';
import { addMinutesToTime, formatMinutes, formatPrice } from '@/lib/utils';

interface RouteSummaryProps {
  preferences: SearchPreferences;
  parking: Parking;
}

/** Riepilogo Partenza → Parcheggio → Destinazione con tempi e costi. */
export function RouteSummary({ preferences, parking }: RouteSummaryProps) {
  const arrivalAtParking = addMinutesToTime(
    preferences.arrivalTime,
    -parking.walkingDurationMinutes,
  );

  return (
    <ol className="relative space-y-4 pl-2">
      <Step
        icon={MapPin}
        tone="text-text-primary"
        title="Partenza"
        subtitle={preferences.origin ?? 'La tua posizione'}
        meta={
          <span className="inline-flex items-center gap-1 text-text-secondary">
            <Car className="h-3.5 w-3.5" aria-hidden />
            {formatMinutes(parking.drivingDurationMinutes)} in auto
          </span>
        }
        connector
      />
      <Step
        icon={CircleParking}
        tone="text-primary"
        title={parking.name}
        subtitle={`${parking.address} · arrivo stimato ${arrivalAtParking}`}
        meta={
          <span className="inline-flex items-center gap-1 text-text-secondary">
            <Footprints className="h-3.5 w-3.5" aria-hidden />
            {formatMinutes(parking.walkingDurationMinutes)} a piedi ·{' '}
            {formatPrice(parking.estimatedTotalPrice)}
          </span>
        }
        connector
      />
      <Step
        icon={Flag}
        tone="text-green"
        title="Destinazione"
        subtitle={`${preferences.destination} · arrivo ${preferences.arrivalTime}`}
      />
    </ol>
  );
}

function Step({
  icon: Icon,
  tone,
  title,
  subtitle,
  meta,
  connector = false,
}: {
  icon: typeof MapPin;
  tone: string;
  title: string;
  subtitle: string;
  meta?: React.ReactNode;
  connector?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {connector && (
        <span
          aria-hidden
          className="absolute left-[15px] top-9 h-[calc(100%+2px)] w-0.5 bg-border"
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface ${tone}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 pb-1">
        <p className="font-bold text-text-primary">{title}</p>
        <p className="truncate text-sm text-text-secondary">{subtitle}</p>
        {meta && <p className="mt-0.5 text-xs">{meta}</p>}
      </div>
    </li>
  );
}
