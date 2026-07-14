import Link from 'next/link';
import { CalendarClock, MapPin, CircleParking } from 'lucide-react';
import type { ParkingPlan, PlanStatus } from '@/types';
import { formatParkingPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const STATUS_META: Record<
  PlanStatus,
  { label: string; tone: 'primary' | 'green' | 'neutral' | 'pink' }
> = {
  scheduled: { label: 'Programmato', tone: 'primary' },
  active: { label: 'Attivo', tone: 'green' },
  completed: { label: 'Completato', tone: 'neutral' },
  cancelled: { label: 'Annullato', tone: 'pink' },
};

export function PlanCard({ plan }: { plan: ParkingPlan }) {
  const status = STATUS_META[plan.status];
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block rounded-3xl border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
          <CalendarClock className="h-4 w-4" aria-hidden />
          {plan.searchPreferences.arrivalDate} · {plan.searchPreferences.arrivalTime}
        </span>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-3 space-y-1">
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green" aria-hidden />
          <span className="truncate font-bold text-text-primary">
            {plan.searchPreferences.destination}
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <CircleParking className="h-4 w-4 text-primary" aria-hidden />
          {plan.selectedParking.name} · {formatParkingPrice(plan.selectedParking)}
        </p>
      </div>
    </Link>
  );
}
