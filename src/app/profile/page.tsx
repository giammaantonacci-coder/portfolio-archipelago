'use client';

import * as React from 'react';
import { User, Car, SlidersHorizontal, Check } from 'lucide-react';
import type { Priority, VehicleType } from '@/types';
import { useProfileStore } from '@/store/profile-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { isDemoMode } from '@/lib/config';
import { PRIORITIES } from '@/lib/priorities';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/states';

const VEHICLES: Array<{ value: VehicleType; label: string }> = [
  { value: 'city_car', label: 'City car' },
  { value: 'sedan', label: 'Berlina' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'electric', label: 'Elettrica' },
];

export default function ProfilePage() {
  const hydrated = useHydrated();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [savedAt, setSavedAt] = React.useState(false);

  if (!hydrated) return <LoadingSkeleton count={3} />;

  const flash = () => {
    setSavedAt(true);
    window.setTimeout(() => setSavedAt(false), 1500);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-extrabold">Profilo</h1>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <User className="h-5 w-5 text-primary" aria-hidden />I tuoi dati
          </h2>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profile.name ?? ''}
              onChange={(e) => setProfile({ name: e.target.value })}
              onBlur={flash}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email ?? ''}
              onChange={(e) => setProfile({ email: e.target.value })}
              onBlur={flash}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Car className="h-5 w-5 text-primary" aria-hidden />
            Veicolo
          </h2>
          <div>
            <Label htmlFor="vehicleType">Tipo</Label>
            <Select
              id="vehicleType"
              value={profile.vehicle?.type ?? ''}
              onChange={(e) =>
                setProfile({
                  vehicle: {
                    ...profile.vehicle,
                    type: (e.target.value || undefined) as VehicleType | undefined,
                  },
                })
              }
            >
              <option value="">Non specificato</option>
              {VEHICLES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="height">Altezza (cm)</Label>
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                value={profile.vehicle?.heightCm ?? ''}
                onChange={(e) =>
                  setProfile({
                    vehicle: {
                      ...profile.vehicle,
                      heightCm: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="length">Lunghezza (cm)</Label>
              <Input
                id="length"
                type="number"
                inputMode="numeric"
                value={profile.vehicle?.lengthCm ?? ''}
                onChange={(e) =>
                  setProfile({
                    vehicle: {
                      ...profile.vehicle,
                      lengthCm: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>
          <Checkbox
            label="Ho bisogno di posti accessibili"
            checked={Boolean(profile.needsAccessibility)}
            onCheckedChange={(c) => setProfile({ needsAccessibility: c })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden />
            Preferenze predefinite
          </h2>
          <div>
            <Label htmlFor="defaultPriority">Priorità predefinita</Label>
            <Select
              id="defaultPriority"
              value={profile.defaultPriority ?? 'balanced'}
              onChange={(e) => setProfile({ defaultPriority: e.target.value as Priority })}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="maxWalk">Max a piedi (m)</Label>
              <Input
                id="maxWalk"
                type="number"
                inputMode="numeric"
                step={100}
                value={profile.maxWalkingDistanceMeters ?? ''}
                onChange={(e) =>
                  setProfile({
                    maxWalkingDistanceMeters: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget massimo (€)</Label>
              <Input
                id="budget"
                type="number"
                inputMode="decimal"
                value={profile.maxBudget ?? ''}
                onChange={(e) =>
                  setProfile({ maxBudget: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-base font-bold">Sincronizzazione</h2>
          {isDemoMode ? (
            <p className="text-sm text-text-secondary">
              Stai usando Parqo in modalità demo: i dati restano su questo dispositivo
              (localStorage). Configura Supabase per sincronizzare piani e preferiti tra dispositivi
              con un accesso via magic link.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">
                Inserisci la tua email per ricevere un magic link e sincronizzare i dati.
              </p>
              <div className="flex gap-2">
                <Input placeholder="tua@email.com" type="email" />
                <Button variant="secondary">Invia link</Button>
              </div>
              <p className="text-xs text-text-secondary">
                L’autenticazione non è obbligatoria per cercare un parcheggio.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {savedAt && (
        <div
          className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-text-primary px-4 py-2 text-sm font-semibold text-white shadow-soft-lg lg:bottom-8"
          role="status"
        >
          <Check className="h-4 w-4" aria-hidden />
          Salvato
        </div>
      )}
    </div>
  );
}
