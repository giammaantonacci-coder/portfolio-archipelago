'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';
import { useProfileStore } from '@/store/profile-store';
import { useSearchResults } from '@/hooks/use-search-results';
import {
  applyFilters,
  countActiveFilters,
  defaultFilterState,
  sortParkings,
  type ParkingFilterState,
  type SortKey,
} from '@/lib/filters';
import { pickRecommended } from '@/lib/scoring';
import { getPriorityMeta } from '@/lib/priorities';
import { analytics } from '@/lib/analytics';
import { isDemoMode } from '@/lib/config';
import { ParkingList } from '@/components/parking/parking-list';
import { ParkingFilters } from '@/components/parking/parking-filters';
import { ParkingSort } from '@/components/parking/parking-sort';
import { CompareBar } from '@/components/parking/compare-bar';
import { DemoDataNotice } from '@/components/parking/demo-data-notice';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ResultsPage() {
  const router = useRouter();
  const preferences = useSearchStore((s) => s.preferences);
  const vehicleHeight = useProfileStore((s) => s.profile.vehicle?.heightCm);
  const { data, isLoading, isError, refetch } = useSearchResults(preferences);

  const [filters, setFilters] = React.useState<ParkingFilterState>(defaultFilterState);
  const [sort, setSort] = React.useState<SortKey>('recommended');

  const recommended = React.useMemo(() => (data ? pickRecommended(data.items) : null), [data]);

  const visible = React.useMemo(() => {
    if (!data) return [];
    const filtered = applyFilters(
      data.items,
      filters,
      vehicleHeight ?? preferences?.vehicleHeightCm,
    );
    return sortParkings(filtered, sort);
  }, [data, filters, sort, vehicleHeight, preferences?.vehicleHeightCm]);

  React.useEffect(() => {
    if (data) {
      analytics.track('search_completed', { count: data.items.length });
      if (data.items.length === 0) analytics.track('no_results');
    }
  }, [data]);

  if (!preferences) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nessuna ricerca attiva"
        description="Torna alla home e dicci dove devi andare."
        action={
          <Button onClick={() => router.push('/')} className="mt-2">
            Vai alla ricerca
          </Button>
        }
      />
    );
  }

  const meta = getPriorityMeta(preferences.priority);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Indietro" onClick={() => router.push('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">{preferences.destination}</h1>
          <p className="truncate text-xs text-text-secondary">
            {preferences.arrivalDate} · {preferences.arrivalTime} · sosta{' '}
            {Math.round(preferences.durationMinutes / 60)}h
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{meta.label}</Badge>
        {data && (
          <Badge tone="neutral">
            {data.items.filter((i) => !i.isIncompatible).length} opzioni compatibili
          </Badge>
        )}
      </div>

      {isDemoMode && <DemoDataNotice />}

      <div className="flex items-center justify-between gap-2">
        <ParkingFilters
          value={filters}
          onChange={(f) => {
            setFilters(f);
            analytics.track('filter_applied');
          }}
          activeCount={countActiveFilters(filters)}
        />
        <ParkingSort value={sort} onChange={setSort} />
      </div>

      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && !isLoading && (
        <>
          {visible.length === 0 ? (
            <EmptyState
              title="Nessun parcheggio rispetta tutti i filtri."
              description="Prova ad aumentare la distanza a piedi o il budget massimo."
              action={
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setFilters(defaultFilterState)}
                >
                  Azzera i filtri
                </Button>
              }
            />
          ) : (
            <ParkingList
              items={visible}
              recommendedId={sort === 'recommended' ? recommended?.parking.id : undefined}
            />
          )}
        </>
      )}

      <CompareBar />
    </div>
  );
}
