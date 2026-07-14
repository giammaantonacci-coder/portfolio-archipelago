'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

interface ProfileState {
  profile: UserProfile;
  setProfile: (patch: Partial<UserProfile>) => void;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  defaultPriority: 'balanced',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      reset: () => set({ profile: defaultProfile }),
    }),
    { name: 'parqo:profile' },
  ),
);
