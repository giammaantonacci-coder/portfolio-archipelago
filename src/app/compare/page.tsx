'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GitCompareArrows } from 'lucide-react';
import { useScoredGroup } from '@/hooks/use-scored-group';
import { useComparisonStore } from '@/store/comparison-store';
import { analytics } from '@/lib/analytics';
import {
  ParkingComparisonTable,
  ComparisonSummary,
} from '@/components/parking/parking-comparison-table';
import { EmptyState, LoadingSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';

export default function ComparePage() {
  const router = useRouter();
  const ids = useComparisonStore((s) => s.ids);
  const clear = useComparisonStore((s) => s.clear);
  const { data, isLoading } = useScoredGroup();

  const items = React.useMemo(
    () => (data ? data.items.filter((i) => ids.includes(i.parking.id)) : []),
    [data, ids],
  );

  React.useEffect(() => {
    if (items.length >= 2) analytics.track('parking_compared', { count: items.length });
  }, [items.length]);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Indietro" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-extrabold">Confronto</h1>
      </div>

      {isLoading && <LoadingSkeleton count={1} />}

      {!isLoading && items.length < 2 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="Seleziona almeno due parcheggi"
          description="Aggiungi fino a tre opzioni al confronto dalla lista dei risultati."
          action={
            <Button className="mt-2" onClick={() => router.push('/results')}>
              Vai ai risultati
            </Button>
          }
        />
      ) : null}

      {!isLoading && items.length >= 2 && (
        <>
          <ComparisonSummary items={items} />
          <ParkingComparisonTable items={items} />
          <div className="flex justify-center">
            <Button variant="ghost" onClick={clear}>
              Svuota confronto
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
