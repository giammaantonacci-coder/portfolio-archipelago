'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Clock,
  Ruler,
  CalendarClock,
  ExternalLink,
  GitCompareArrows,
} from 'lucide-react';
import { useScoredGroup } from '@/hooks/use-scored-group';
import { useDeferredRouter } from '@/hooks/use-deferred-router';
import { pickBackup } from '@/lib/scoring';
import { useComparisonStore } from '@/store/comparison-store';
import { usePlanDraftStore } from '@/store/plan-draft-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { analytics } from '@/lib/analytics';
import { isDemoMode } from '@/lib/config';
import { formatDistance, formatMinutes, formatPrice, createId, cn } from '@/lib/utils';
import { getPriorityMeta } from '@/lib/priorities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SmartScoreBadge } from '@/components/parking/smart-score-badge';
import { ParkingTags } from '@/components/parking/parking-tags';
import { ConfidenceBadge } from '@/components/parking/confidence-badge';
import { ParkingProsCons } from '@/components/parking/parking-pros-cons';
import { ScoreBreakdown } from '@/components/parking/score-breakdown';
import { DemoDataNotice } from '@/components/parking/demo-data-notice';
import { RouteMap } from '@/components/route/route-map';
import { LoadingSkeleton, EmptyState } from '@/components/states';

export default function ParkingDetailPage() {
  const router = useRouter();
  const deferredRouter = useDeferredRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { preferences, data, isLoading } = useScoredGroup();

  const toggleCompare = useComparisonStore((s) => s.toggle);
  const inCompare = useComparisonStore((s) => s.ids.includes(id));
  const setDraft = usePlanDraftStore((s) => s.setDraft);
  const addFavorite = useFavoritesStore((s) => s.add);
  const isFavorite = useFavoritesStore((s) => s.hasParking(id));

  const item = React.useMemo(() => data?.items.find((i) => i.parking.id === id), [data, id]);

  React.useEffect(() => {
    if (item) analytics.track('parking_opened', { id });
  }, [item, id]);

  if (isLoading) return <LoadingSkeleton count={2} />;
  if (!item) {
    return (
      <EmptyState
        title="Parcheggio non trovato"
        description="Potrebbe non essere più disponibile."
        action={
          <Button className="mt-2" onClick={() => router.push('/results')}>
            Torna ai risultati
          </Button>
        }
      />
    );
  }

  const { parking, score } = item;
  const backup = data ? pickBackup(data.items, parking.id) : null;
  const meta = getPriorityMeta(preferences.priority);

  const handleChoose = () => {
    setDraft({
      preferences,
      selectedParking: parking,
      backupParking: backup?.parking ?? null,
    });
    analytics.track('parking_selected', { id: parking.id });
    deferredRouter.push('/route-plan');
  };

  const handleFavorite = () => {
    addFavorite({
      id: createId('fav'),
      kind: 'parking',
      label: parking.name,
      createdAt: new Date().toISOString(),
      parking,
      isDemo: parking.isDemo,
    });
    analytics.track('favorite_added', { id: parking.id });
  };

  return (
    <div className="animate-fade-in space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Indietro" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant={isFavorite ? 'secondary' : 'outline'}
          size="sm"
          aria-pressed={isFavorite}
          onClick={handleFavorite}
          disabled={isFavorite}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden />
          {isFavorite ? 'Nei preferiti' : 'Salva'}
        </Button>
      </div>

      <div
        className="flex h-40 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-soft to-blue-soft text-primary"
        aria-hidden
      >
        <span className="text-5xl font-black opacity-60">P</span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold">{parking.name}</h1>
          <p className="text-sm text-text-secondary">
            {parking.address}, {parking.city}
          </p>
        </div>
        <SmartScoreBadge score={score.total} size="lg" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Prezzo stimato" value={formatPrice(parking.estimatedTotalPrice)} />
        <StatBox
          label="A piedi"
          value={`${formatMinutes(parking.walkingDurationMinutes)}`}
          sub={formatDistance(parking.walkingDistanceMeters)}
        />
        <StatBox label="Tempo totale" value={formatMinutes(parking.totalDurationMinutes)} />
      </div>

      <ParkingTags tags={parking.tags} />

      {isDemoMode && <DemoDataNotice />}

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-bold">Perché te lo consigliamo</h2>
          <p className="text-sm text-text-secondary">{score.explanation}</p>
          <ParkingProsCons pros={score.pros} cons={score.cons} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-bold">Come è stato calcolato il punteggio</h2>
          <p className="text-sm text-text-secondary">
            Priorità selezionata: <strong className="text-text-primary">{meta.label}</strong>. I
            valori sono normalizzati rispetto agli altri parcheggi della ricerca.
          </p>
          <ScoreBreakdown score={score} priority={preferences.priority} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-bold">Dettagli</h2>
          <RouteMap
            destination={{
              latitude: preferences.destinationLatitude ?? parking.latitude,
              longitude: preferences.destinationLongitude ?? parking.longitude,
            }}
            parking={{ latitude: parking.latitude, longitude: parking.longitude }}
          />
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <DetailRow icon={Clock} label="Orari" value={openingLabel(parking)} />
            <DetailRow
              icon={Ruler}
              label="Altezza max"
              value={
                parking.maxVehicleHeightCm ? `${parking.maxVehicleHeightCm} cm` : 'Da verificare'
              }
            />
            <DetailRow
              icon={CalendarClock}
              label="Ultimo aggiornamento"
              value={parking.lastVerifiedAt ? formatDate(parking.lastVerifiedAt) : '—'}
            />
          </dl>
          <div className="flex items-center justify-between">
            <ConfidenceBadge confidence={parking.dataConfidence} />
            {parking.externalUrl && (
              <a
                href={parking.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Sito esterno <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {backup && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-base font-bold">Alternativa consigliata</h2>
            <p className="text-sm text-text-secondary">
              Se questo è pieno, valuta{' '}
              <Link href={`/parking/${backup.parking.id}`} className="font-semibold text-primary">
                {backup.parking.name}
              </Link>{' '}
              ({formatPrice(backup.parking.estimatedTotalPrice)} ·{' '}
              {formatMinutes(backup.parking.walkingDurationMinutes)} a piedi).
            </p>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-[76px] z-30 flex gap-2 lg:bottom-4">
        <Button
          variant="outline"
          className="flex-1"
          aria-pressed={inCompare}
          onClick={() => toggleCompare(parking.id)}
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          Confronta
        </Button>
        <Button className="flex-[2]" onClick={handleChoose}>
          Scegli questo parcheggio
        </Button>
      </div>

      <p className="text-center text-xs text-text-secondary">
        Le informazioni hanno finalità indicative. Verifica sempre segnaletica, tariffe, accessi e
        disponibilità sul posto.
      </p>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <p className="text-[11px] font-medium text-text-secondary">{label}</p>
      <p className="text-base font-bold text-text-primary">{value}</p>
      {sub && <p className="text-[11px] text-text-secondary">{sub}</p>}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-background px-3 py-2">
      <dt className="flex items-center gap-2 text-text-secondary">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </dt>
      <dd className="font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function openingLabel(parking: {
  isOpen24Hours: boolean;
  openingTime?: string;
  closingTime?: string;
}) {
  if (parking.isOpen24Hours) return 'Aperto 24h';
  if (parking.openingTime && parking.closingTime)
    return `${parking.openingTime}–${parking.closingTime}`;
  return 'Da verificare';
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
