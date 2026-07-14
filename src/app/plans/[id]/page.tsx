'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, XCircle, CheckCircle2 } from 'lucide-react';
import type { PlanStatus } from '@/types';
import { usePlansStore } from '@/store/plans-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatMinutes, formatParkingPrice } from '@/lib/utils';
import { getPriorityMeta } from '@/lib/priorities';
import { RouteSummary } from '@/components/route/route-summary';
import { DemoDataNotice } from '@/components/parking/demo-data-notice';
import { EmptyState, LoadingSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_LABEL: Record<PlanStatus, string> = {
  scheduled: 'Programmato',
  active: 'Attivo',
  completed: 'Completato',
  cancelled: 'Annullato',
};

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const plan = usePlansStore((s) => s.plans.find((p) => p.id === params.id));
  const updatePlan = usePlansStore((s) => s.updatePlan);
  const removePlan = usePlansStore((s) => s.removePlan);

  if (!hydrated) return <LoadingSkeleton count={2} />;
  if (!plan) {
    return (
      <EmptyState
        title="Piano non trovato"
        action={
          <Button className="mt-2" onClick={() => router.push('/plans')}>
            Torna ai piani
          </Button>
        }
      />
    );
  }

  const meta = getPriorityMeta(plan.searchPreferences.priority);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Indietro"
          onClick={() => router.push('/plans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Badge tone="primary">{STATUS_LABEL[plan.status]}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold">{plan.searchPreferences.destination}</h1>
        <p className="text-sm text-text-secondary">
          {plan.searchPreferences.arrivalDate} · {plan.searchPreferences.arrivalTime} · {meta.label}
        </p>
      </div>

      {plan.isDemo && <DemoDataNotice />}

      <Card>
        <CardContent>
          <RouteSummary preferences={plan.searchPreferences} parking={plan.selectedParking} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Costo stimato" value={formatParkingPrice(plan.selectedParking)} />
        <Stat
          label="Tempo totale"
          value={formatMinutes(plan.selectedParking.totalDurationMinutes)}
        />
      </div>

      {plan.backupParking && (
        <Card>
          <CardContent className="space-y-1">
            <h2 className="text-base font-bold">Piano B</h2>
            <p className="text-sm text-text-secondary">
              {plan.backupParking.name} · {formatParkingPrice(plan.backupParking)}
            </p>
          </CardContent>
        </Card>
      )}

      {plan.note && (
        <Card>
          <CardContent>
            <h2 className="mb-1 text-base font-bold">Note</h2>
            <p className="text-sm text-text-secondary">{plan.note}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/parking/${plan.selectedParking.id}`}
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Vedi parcheggio
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        {plan.status !== 'completed' && (
          <Button variant="outline" onClick={() => updatePlan(plan.id, { status: 'completed' })}>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Completato
          </Button>
        )}
        {plan.status !== 'cancelled' && (
          <Button variant="outline" onClick={() => updatePlan(plan.id, { status: 'cancelled' })}>
            <XCircle className="h-4 w-4" aria-hidden />
            Annulla
          </Button>
        )}
        <Button
          variant="danger"
          className="col-span-2"
          onClick={() => {
            removePlan(plan.id);
            router.push('/plans');
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Elimina piano
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <p className="text-[11px] font-medium text-text-secondary">{label}</p>
      <p className="text-base font-bold text-text-primary">{value}</p>
    </div>
  );
}
