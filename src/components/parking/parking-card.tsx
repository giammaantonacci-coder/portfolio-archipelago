'use client';

import Link from 'next/link';
import { Footprints, Car, Clock, Wallet, Check, Sparkles, AlertTriangle } from 'lucide-react';
import type { ScoredParking } from '@/types';
import { formatDistance, formatMinutes, formatPrice, cn } from '@/lib/utils';
import { SmartScoreBadge } from './smart-score-badge';
import { ParkingTags } from './parking-tags';
import { ConfidenceBadge } from './confidence-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useComparisonStore, MAX_COMPARE } from '@/store/comparison-store';

interface ParkingCardProps {
  item: ScoredParking;
  recommended?: boolean;
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-[11px] font-medium text-text-secondary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-sm font-bold text-text-primary">{value}</span>
    </div>
  );
}

export function ParkingCard({ item, recommended = false }: ParkingCardProps) {
  const { parking, score, isIncompatible } = item;
  const compareIds = useComparisonStore((s) => s.ids);
  const toggleCompare = useComparisonStore((s) => s.toggle);
  const inCompare = compareIds.includes(parking.id);
  const compareFull = compareIds.length >= MAX_COMPARE && !inCompare;

  return (
    <article
      className={cn(
        'rounded-3xl border bg-surface p-4 shadow-soft transition-shadow hover:shadow-soft-lg',
        recommended ? 'ring-primary/30 border-primary ring-1' : 'border-border',
        isIncompatible && 'opacity-80',
      )}
    >
      {recommended && (
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Scelta consigliata
        </p>
      )}
      {isIncompatible && (
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-pink-soft px-2.5 py-1 text-xs font-bold text-[#c23f6c]">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Non compatibile
        </p>
      )}

      <div className="flex gap-4">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-soft to-blue-soft text-primary"
          aria-hidden
        >
          <span className="text-2xl font-black opacity-70">P</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-text-primary">{parking.name}</h3>
              <p className="truncate text-xs text-text-secondary">{parking.address}</p>
            </div>
            <SmartScoreBadge score={score.total} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
            <Metric
              icon={Wallet}
              label="Stimato"
              value={formatPrice(parking.estimatedTotalPrice)}
            />
            <Metric
              icon={Footprints}
              label="A piedi"
              value={`${formatDistance(parking.walkingDistanceMeters)} · ${formatMinutes(parking.walkingDurationMinutes)}`}
            />
            <Metric
              icon={Car}
              label="In auto"
              value={formatMinutes(parking.drivingDurationMinutes)}
            />
            <Metric
              icon={Clock}
              label="Totale"
              value={formatMinutes(parking.totalDurationMinutes)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ParkingTags tags={parking.tags} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <ConfidenceBadge confidence={parking.dataConfidence} />
        <div className="flex items-center gap-2">
          <Button
            variant={inCompare ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={inCompare}
            disabled={compareFull}
            onClick={() => toggleCompare(parking.id)}
          >
            {inCompare ? <Check className="h-4 w-4" aria-hidden /> : null}
            Confronta
          </Button>
          <Link
            href={`/parking/${parking.id}`}
            className={buttonVariants({ size: 'sm', variant: 'primary' })}
          >
            Dettaglio
          </Link>
        </div>
      </div>
    </article>
  );
}
