'use client';

import * as React from 'react';
import { CalendarCheck } from 'lucide-react';
import { usePlansStore } from '@/store/plans-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { compareTimes } from '@/lib/utils';
import { PlanCard } from '@/components/plans/plan-card';
import { EmptyState, LoadingSkeleton } from '@/components/states';

function isUpcoming(dateIso: string, time: string): boolean {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (dateIso > today) return true;
  if (dateIso < today) return false;
  return compareTimes(time, now.toTimeString().slice(0, 5)) >= 0;
}

export default function PlansPage() {
  const hydrated = useHydrated();
  const plans = usePlansStore((s) => s.plans);

  const { upcoming, past } = React.useMemo(() => {
    const up = plans.filter(
      (p) =>
        (p.status === 'scheduled' || p.status === 'active') &&
        isUpcoming(p.searchPreferences.arrivalDate, p.searchPreferences.arrivalTime),
    );
    const pastPlans = plans.filter((p) => !up.includes(p));
    return { upcoming: up, past: pastPlans };
  }, [plans]);

  if (!hydrated) return <LoadingSkeleton count={2} />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-extrabold">Piani</h1>

      {plans.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nessun piano salvato"
          description="Quando scegli un parcheggio e salvi il percorso, lo ritrovi qui."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-text-secondary">Prossimi</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-text-secondary">Nessun piano in programma.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((p) => (
                  <li key={p.id}>
                    <PlanCard plan={p} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-text-secondary">Passati</h2>
              <ul className="space-y-3">
                {past.map((p) => (
                  <li key={p.id}>
                    <PlanCard plan={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
