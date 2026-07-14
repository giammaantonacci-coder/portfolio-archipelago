'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, Save, ShieldQuestion } from 'lucide-react';
import { usePlanDraftStore } from '@/store/plan-draft-store';
import { usePlansStore } from '@/store/plans-store';
import { analytics } from '@/lib/analytics';
import { isDemoMode } from '@/lib/config';
import { googleMapsLink, appleMapsLink } from '@/lib/nav-links';
import { addMinutesToTime, createId, formatMinutes, formatPrice, sanitizeText } from '@/lib/utils';
import type { ParkingPlan } from '@/types';
import { RouteMap } from '@/components/route/route-map';
import { RouteSummary } from '@/components/route/route-summary';
import { DemoDataNotice } from '@/components/parking/demo-data-notice';
import { EmptyState } from '@/components/states';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RoutePlanPage() {
  const router = useRouter();
  const { preferences, selectedParking, backupParking, note, setNote } = usePlanDraftStore();
  const savePlan = usePlansStore((s) => s.savePlan);
  const [saved, setSaved] = React.useState(false);

  if (!preferences || !selectedParking) {
    return (
      <EmptyState
        title="Nessun piano in corso"
        description="Scegli un parcheggio dai risultati per costruire il tuo percorso."
        action={
          <Button className="mt-2" onClick={() => router.push('/results')}>
            Vai ai risultati
          </Button>
        }
      />
    );
  }

  const totalMinutes = selectedParking.totalDurationMinutes;
  const totalCost = selectedParking.estimatedTotalPrice;
  const arrival = preferences.arrivalTime;
  const departure = addMinutesToTime(preferences.arrivalTime, preferences.durationMinutes);

  const destinationCoords = {
    latitude: preferences.destinationLatitude ?? selectedParking.latitude,
    longitude: preferences.destinationLongitude ?? selectedParking.longitude,
  };
  const parkingCoords = {
    latitude: selectedParking.latitude,
    longitude: selectedParking.longitude,
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const plan: ParkingPlan = {
      id: createId('plan'),
      searchPreferences: preferences,
      selectedParking,
      backupParking: backupParking ?? undefined,
      estimatedArrivalTime: arrival,
      note: note ? sanitizeText(note) : undefined,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      isDemo: isDemoMode || selectedParking.isDemo,
    };
    savePlan(plan);
    analytics.track('plan_saved', { id: plan.id });
    if (backupParking) analytics.track('backup_selected', { id: backupParking.id });
    setSaved(true);
  };

  const handleStart = () => analytics.track('route_started', { id: selectedParking.id });

  return (
    <div className="animate-fade-in space-y-4 pb-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Indietro" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-extrabold">Il tuo percorso</h1>
      </div>

      {isDemoMode && <DemoDataNotice />}

      <RouteMap parking={parkingCoords} destination={destinationCoords} />

      <Card>
        <CardContent>
          <RouteSummary preferences={preferences} parking={selectedParking} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Tempo totale" value={formatMinutes(totalMinutes)} />
        <Stat label="Costo parcheggio" value={formatPrice(totalCost)} />
        <Stat label="Sosta" value={`${arrival}–${departure}`} />
      </div>

      {/* Piano B */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <ShieldQuestion className="h-5 w-5 text-primary" aria-hidden />
            Piano B — meglio avere un’alternativa
          </h2>
          {backupParking ? (
            <p className="text-sm text-text-secondary">
              Se <strong className="text-text-primary">{selectedParking.name}</strong> è pieno,
              Parqo ti porta direttamente a{' '}
              <strong className="text-text-primary">{backupParking.name}</strong> (
              {formatPrice(backupParking.estimatedTotalPrice)} ·{' '}
              {formatMinutes(backupParking.walkingDurationMinutes)} a piedi).
            </p>
          ) : (
            <p className="text-sm text-text-secondary">
              Nessuna alternativa impostata. Torna ai risultati per aggiungere un piano B.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Note */}
      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-semibold">
          Note (facoltative)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Es. Ricordati il biglietto per l’uscita."
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm focus-visible:border-primary focus-visible:outline-none"
        />
      </div>

      {/* Azioni */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <a
            href={googleMapsLink(
              parkingCoords,
              preferences.originLatitude
                ? { latitude: preferences.originLatitude, longitude: preferences.originLongitude! }
                : undefined,
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStart}
            className={buttonVariants({ className: 'flex-1' })}
          >
            <Navigation className="h-4 w-4" aria-hidden />
            Avvia (Google)
          </a>
          <a
            href={appleMapsLink(parkingCoords)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStart}
            className={buttonVariants({ variant: 'outline', className: 'flex-1' })}
          >
            Apple Maps
          </a>
        </div>
        <Button variant="secondary" className="w-full" onClick={handleSave} disabled={saved}>
          <Save className="h-4 w-4" aria-hidden />
          {saved ? 'Piano salvato' : 'Salva piano'}
        </Button>
        {saved && (
          <div className="rounded-2xl bg-green-soft px-4 py-3 text-sm text-[#2b8f55]" role="status">
            <strong>Piano salvato.</strong> Lo ritroverai nella sezione Piani.{' '}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => router.push('/plans')}
            >
              Vai ai Piani
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <p className="text-[11px] font-medium text-text-secondary">{label}</p>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}
