'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParkingPlan } from '@/types';

interface PlansState {
  plans: ParkingPlan[];
  savePlan: (plan: ParkingPlan) => void;
  updatePlan: (id: string, patch: Partial<ParkingPlan>) => void;
  removePlan: (id: string) => void;
  getPlan: (id: string) => ParkingPlan | undefined;
}

/** Piani salvati. In demo persistono in localStorage; con Supabase si sincronizzano. */
export const usePlansStore = create<PlansState>()(
  persist(
    (set, get) => ({
      plans: [],
      savePlan: (plan) =>
        set((state) => {
          const existing = state.plans.findIndex((p) => p.id === plan.id);
          if (existing >= 0) {
            const next = [...state.plans];
            next[existing] = plan;
            return { plans: next };
          }
          return { plans: [plan, ...state.plans] };
        }),
      updatePlan: (id, patch) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),
      removePlan: (id) => set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
      getPlan: (id) => get().plans.find((p) => p.id === id),
    }),
    { name: 'parqo:plans' },
  ),
);
