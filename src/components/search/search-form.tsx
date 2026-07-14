'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import type { Priority, SearchPreferences, VehicleType } from '@/types';
import { searchPreferencesSchema, type SearchFormValues } from '@/lib/validation';
import { useSearchStore } from '@/store/search-store';
import { useProfileStore } from '@/store/profile-store';
import { useDeferredRouter } from '@/hooks/use-deferred-router';
import { analytics } from '@/lib/analytics';
import { sanitizeText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PrioritySelector } from './priority-selector';

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 ora' },
  { value: 120, label: '2 ore' },
  { value: 240, label: '4 ore' },
  { value: 600, label: 'Tutto il giorno' },
];

const VEHICLES: Array<{ value: VehicleType; label: string }> = [
  { value: 'city_car', label: 'City car' },
  { value: 'sedan', label: 'Berlina' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'electric', label: 'Elettrica' },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SearchForm() {
  const router = useDeferredRouter();
  const setPreferences = useSearchStore((s) => s.setPreferences);
  const profile = useProfileStore((s) => s.profile);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchPreferencesSchema),
    defaultValues: {
      destination: '',
      origin: '',
      arrivalDate: todayIso(),
      arrivalTime: '10:00',
      durationMinutes: 120,
      priority: profile.defaultPriority ?? 'balanced',
      vehicleType: profile.vehicle?.type,
      vehicleHeightCm: profile.vehicle?.heightCm,
      needsAccessibility: profile.needsAccessibility,
      needsEvCharging: profile.vehicle?.type === 'electric' ? true : undefined,
      maxPrice: profile.maxBudget,
      maxWalkingDistanceMeters: profile.maxWalkingDistanceMeters,
    },
  });

  const onSubmit = (values: SearchFormValues) => {
    const prefs: SearchPreferences = {
      ...values,
      destination: sanitizeText(values.destination),
      origin: values.origin ? sanitizeText(values.origin) : undefined,
      needsEvCharging: values.needsEvCharging || values.vehicleType === 'electric',
    };
    setPreferences(prefs);
    analytics.track('search_started', { priority: prefs.priority });
    router.push('/results');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="destination">Dove devi andare?</Label>
        <Input
          id="destination"
          placeholder="Es. Centro, ospedale, ufficio…"
          autoComplete="off"
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? 'destination-error' : undefined}
          {...register('destination')}
        />
        {errors.destination && (
          <p id="destination-error" className="mt-1 text-xs font-medium text-red">
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="arrivalDate">Giorno</Label>
          <Input id="arrivalDate" type="date" {...register('arrivalDate')} />
        </div>
        <div>
          <Label htmlFor="arrivalTime">Ora di arrivo</Label>
          <Input id="arrivalTime" type="time" {...register('arrivalTime')} />
          {errors.arrivalTime && (
            <p className="mt-1 text-xs font-medium text-red">{errors.arrivalTime.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="durationMinutes">Durata della sosta</Label>
        <Select id="durationMinutes" {...register('durationMinutes', { valueAsNumber: true })}>
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="origin">Partenza (facoltativa)</Label>
        <Input id="origin" placeholder="Es. Casa, stazione…" {...register('origin')} />
      </div>

      <div>
        <Label htmlFor="vehicleType">Veicolo</Label>
        <Select id="vehicleType" {...register('vehicleType')}>
          <option value="">Non specificato</option>
          {VEHICLES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-text-primary">Priorità</legend>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <PrioritySelector value={field.value as Priority} onChange={(v) => field.onChange(v)} />
          )}
        />
      </fieldset>

      <Button type="submit" size="lg" className="w-full">
        <Search className="h-5 w-5" aria-hidden />
        Trova il parcheggio migliore
      </Button>
    </form>
  );
}
