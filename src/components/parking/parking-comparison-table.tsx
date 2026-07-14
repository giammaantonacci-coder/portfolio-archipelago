'use client';

import { Check, X } from 'lucide-react';
import type { ScoredParking } from '@/types';
import { formatDistance, formatMinutes, formatPrice, cn } from '@/lib/utils';

interface ComparisonTableProps {
  items: ScoredParking[];
}

type Direction = 'min' | 'max';

interface Row {
  label: string;
  get: (i: ScoredParking) => number | boolean | string;
  render: (i: ScoredParking) => React.ReactNode;
  best?: Direction;
}

const ROWS: Row[] = [
  {
    label: 'Costo stimato',
    get: (i) => i.parking.estimatedTotalPrice,
    render: (i) => formatPrice(i.parking.estimatedTotalPrice),
    best: 'min',
  },
  {
    label: 'Distanza a piedi',
    get: (i) => i.parking.walkingDistanceMeters,
    render: (i) => formatDistance(i.parking.walkingDistanceMeters),
    best: 'min',
  },
  {
    label: 'Minuti a piedi',
    get: (i) => i.parking.walkingDurationMinutes,
    render: (i) => formatMinutes(i.parking.walkingDurationMinutes),
    best: 'min',
  },
  {
    label: 'Tempo in auto',
    get: (i) => i.parking.drivingDurationMinutes,
    render: (i) => formatMinutes(i.parking.drivingDurationMinutes),
    best: 'min',
  },
  {
    label: 'Tempo totale',
    get: (i) => i.parking.totalDurationMinutes,
    render: (i) => formatMinutes(i.parking.totalDurationMinutes),
    best: 'min',
  },
  {
    label: 'Fuori ZTL',
    get: (i) => i.parking.isOutsideZtl,
    render: (i) => bool(i.parking.isOutsideZtl),
  },
  { label: 'Coperto', get: (i) => i.parking.isCovered, render: (i) => bool(i.parking.isCovered) },
  {
    label: 'Prenotabile',
    get: (i) => i.parking.isBookable,
    render: (i) => bool(i.parking.isBookable),
  },
  {
    label: 'Ricarica EV',
    get: (i) => i.parking.hasEvCharging,
    render: (i) => bool(i.parking.hasEvCharging),
  },
  {
    label: 'Accessibile',
    get: (i) => i.parking.isAccessible,
    render: (i) => bool(i.parking.isAccessible),
  },
  {
    label: 'Orari',
    get: (i) =>
      i.parking.isOpen24Hours
        ? '24h'
        : `${i.parking.openingTime ?? '?'}–${i.parking.closingTime ?? '?'}`,
    render: (i) =>
      i.parking.isOpen24Hours
        ? '24h'
        : `${i.parking.openingTime ?? '?'}–${i.parking.closingTime ?? '?'}`,
  },
  {
    label: 'Affidabilità',
    get: (i) => i.parking.dataConfidence,
    render: (i) => confidenceLabel(i.parking.dataConfidence),
  },
  {
    label: 'Smart score',
    get: (i) => i.score.total,
    render: (i) => String(i.score.total),
    best: 'max',
  },
];

function bool(value: boolean) {
  return value ? (
    <Check className="mx-auto h-4 w-4 text-green" aria-label="sì" />
  ) : (
    <X className="mx-auto h-4 w-4 text-text-secondary" aria-label="no" />
  );
}

function confidenceLabel(c: 'low' | 'medium' | 'high') {
  return c === 'high' ? 'Alta' : c === 'medium' ? 'Media' : 'Stimata';
}

function bestIndexes(items: ScoredParking[], row: Row): Set<number> {
  const set = new Set<number>();
  if (!row.best) {
    // per i booleani evidenziamo tutti i "true"
    items.forEach((i, idx) => {
      if (row.get(i) === true) set.add(idx);
    });
    return set;
  }
  const values = items.map((i) => row.get(i) as number);
  const target = row.best === 'min' ? Math.min(...values) : Math.max(...values);
  values.forEach((v, idx) => {
    if (v === target) set.add(idx);
  });
  return set;
}

export function ParkingComparisonTable({ items }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <caption className="sr-only">Confronto parcheggi</caption>
        <thead>
          <tr>
            <th scope="col" className="p-3 text-left font-semibold text-text-secondary">
              Caratteristica
            </th>
            {items.map((i) => (
              <th
                key={i.parking.id}
                scope="col"
                className="p-3 text-center font-bold text-text-primary"
              >
                {i.parking.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const best = bestIndexes(items, row);
            return (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-text-secondary">
                  {row.label}
                </th>
                {items.map((i, idx) => (
                  <td
                    key={i.parking.id}
                    className={cn(
                      'p-3 text-center text-text-primary',
                      best.has(idx) && row.best && 'bg-green-soft font-bold text-[#2b8f55]',
                    )}
                  >
                    {row.render(i)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Riepilogo: migliore per prezzo, distanza, comodità e scelta complessiva. */
export function ComparisonSummary({ items }: ComparisonTableProps) {
  if (items.length === 0) return null;
  const byPrice = [...items].sort(
    (a, b) => a.parking.estimatedTotalPrice - b.parking.estimatedTotalPrice,
  )[0]!;
  const byDistance = [...items].sort(
    (a, b) => a.parking.walkingDistanceMeters - b.parking.walkingDistanceMeters,
  )[0]!;
  const byConvenience = [...items].sort(
    (a, b) => b.score.convenienceScore - a.score.convenienceScore,
  )[0]!;
  const overall = [...items].sort((a, b) => b.score.total - a.score.total)[0]!;

  const rows = [
    { label: 'Migliore per il prezzo', value: byPrice.parking.name },
    { label: 'Migliore per la distanza', value: byDistance.parking.name },
    { label: 'Migliore per la comodità', value: byConvenience.parking.name },
    { label: 'Migliore scelta complessiva', value: overall.parking.name },
  ];

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex items-center justify-between gap-2 rounded-2xl bg-purple-soft px-4 py-3"
        >
          <span className="text-xs font-medium text-primary">{r.label}</span>
          <span className="text-right text-sm font-bold text-text-primary">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
