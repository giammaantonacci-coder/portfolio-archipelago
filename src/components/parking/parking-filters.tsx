'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { DataConfidence } from '@/types';
import { defaultFilterState, type ParkingFilterState } from '@/lib/filters';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ParkingFiltersProps {
  value: ParkingFilterState;
  onChange: (value: ParkingFilterState) => void;
  activeCount: number;
}

const TOGGLES: Array<{ key: keyof ParkingFilterState; label: string }> = [
  { key: 'coveredOnly', label: 'Coperto' },
  { key: 'evOnly', label: 'Ricarica elettrica' },
  { key: 'accessibleOnly', label: 'Accessibile' },
  { key: 'openForStayOnly', label: 'Aperto durante la sosta' },
  { key: 'outsideZtlOnly', label: 'Fuori ZTL' },
  { key: 'bookableOnly', label: 'Prenotabile' },
  { key: 'fitsVehicleHeight', label: 'Compatibile con altezza veicolo' },
];

export function ParkingFilters({ value, onChange, activeCount }: ParkingFiltersProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ParkingFilterState>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = <K extends keyof ParkingFilterState>(key: K, v: ParkingFilterState[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filtri
        {activeCount > 0 && (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filtri"
        footer={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setDraft(defaultFilterState);
                onChange(defaultFilterState);
                setOpen(false);
              }}
            >
              Azzera
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Applica
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="maxPrice">Prezzo massimo (€)</Label>
              <Input
                id="maxPrice"
                type="number"
                inputMode="decimal"
                min={0}
                value={draft.maxPrice ?? ''}
                onChange={(e) =>
                  set('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <Label htmlFor="maxWalk">Max a piedi (m)</Label>
              <Input
                id="maxWalk"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={draft.maxWalkingDistanceMeters ?? ''}
                onChange={(e) =>
                  set(
                    'maxWalkingDistanceMeters',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            {TOGGLES.map((t) => (
              <Checkbox
                key={t.key}
                label={t.label}
                checked={Boolean(draft[t.key])}
                onCheckedChange={(checked) => set(t.key, checked as never)}
              />
            ))}
          </div>

          <div>
            <Label htmlFor="minConfidence">Affidabilità minima del dato</Label>
            <Select
              id="minConfidence"
              value={draft.minConfidence ?? ''}
              onChange={(e) =>
                set('minConfidence', (e.target.value || undefined) as DataConfidence | undefined)
              }
            >
              <option value="">Qualsiasi</option>
              <option value="medium">Media o alta</option>
              <option value="high">Solo alta</option>
            </Select>
          </div>
        </div>
      </Sheet>
    </>
  );
}
