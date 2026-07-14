'use client';

import { create } from 'zustand';
import type { Parking, SearchPreferences } from '@/types';

interface PlanDraftState {
  preferences: SearchPreferences | null;
  selectedParking: Parking | null;
  backupParking: Parking | null;
  note: string;
  setDraft: (draft: {
    preferences: SearchPreferences;
    selectedParking: Parking;
    backupParking?: Parking | null;
  }) => void;
  setBackup: (parking: Parking | null) => void;
  setNote: (note: string) => void;
  clear: () => void;
}

/** Bozza del piano in costruzione (piano A + piano B) prima del salvataggio. */
export const usePlanDraftStore = create<PlanDraftState>((set) => ({
  preferences: null,
  selectedParking: null,
  backupParking: null,
  note: '',
  setDraft: ({ preferences, selectedParking, backupParking }) =>
    set({ preferences, selectedParking, backupParking: backupParking ?? null }),
  setBackup: (parking) => set({ backupParking: parking }),
  setNote: (note) => set({ note }),
  clear: () => set({ preferences: null, selectedParking: null, backupParking: null, note: '' }),
}));
