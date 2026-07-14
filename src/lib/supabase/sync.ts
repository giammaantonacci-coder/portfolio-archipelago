import type { SupabaseClient } from '@supabase/supabase-js';
import type { Favorite, ParkingPlan, UserProfile } from '@/types';

/**
 * Mappatura e sincronizzazione best-effort verso Supabase.
 * Ogni funzione è difensiva: in caso di errore non blocca l'app, che continua a
 * funzionare con lo storage locale. Attiva solo con Supabase configurato + login.
 */

// ---------- Plans ----------

interface PlanRow {
  id: string;
  user_id: string;
  search_preferences: ParkingPlan['searchPreferences'];
  estimated_arrival_time: string | null;
  note: string | null;
  status: ParkingPlan['status'];
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // snapshot dei parcheggi salvati nel piano
  selected_parking: ParkingPlan['selectedParking'];
  backup_parking: ParkingPlan['selectedParking'] | null;
}

function planToRow(plan: ParkingPlan, userId: string): PlanRow {
  return {
    id: plan.id,
    user_id: userId,
    search_preferences: plan.searchPreferences,
    estimated_arrival_time: plan.estimatedArrivalTime ?? null,
    note: plan.note ?? null,
    status: plan.status,
    is_demo: plan.isDemo,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
    selected_parking: plan.selectedParking,
    backup_parking: plan.backupParking ?? null,
  };
}

function rowToPlan(row: PlanRow): ParkingPlan {
  return {
    id: row.id,
    userId: row.user_id,
    searchPreferences: row.search_preferences,
    selectedParking: row.selected_parking,
    backupParking: row.backup_parking ?? undefined,
    estimatedArrivalTime: row.estimated_arrival_time ?? undefined,
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDemo: row.is_demo,
  };
}

export async function pullPlans(supabase: SupabaseClient, userId: string): Promise<ParkingPlan[]> {
  const { data, error } = await supabase
    .from('parking_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as PlanRow[]).map(rowToPlan);
}

export async function pushPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: ParkingPlan,
): Promise<void> {
  await supabase.from('parking_plans').upsert(planToRow(plan, userId));
}

export async function deletePlanRemote(supabase: SupabaseClient, id: string): Promise<void> {
  await supabase.from('parking_plans').delete().eq('id', id);
}

// ---------- Favorites ----------

interface FavoriteRow {
  id: string;
  user_id: string;
  payload: Favorite;
  created_at: string;
}

export async function pullFavorites(supabase: SupabaseClient, userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorite_parkings')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return [];
  return (data as FavoriteRow[]).map((r) => r.payload);
}

export async function pushFavorite(
  supabase: SupabaseClient,
  userId: string,
  favorite: Favorite,
): Promise<void> {
  await supabase.from('favorite_parkings').upsert({
    id: favorite.id,
    user_id: userId,
    payload: favorite,
    created_at: favorite.createdAt,
  });
}

export async function deleteFavoriteRemote(supabase: SupabaseClient, id: string): Promise<void> {
  await supabase.from('favorite_parkings').delete().eq('id', id);
}

// ---------- Profile ----------

export async function pullProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    needsAccessibility: data.needs_accessibility ?? undefined,
    defaultPriority: data.default_priority ?? undefined,
    maxWalkingDistanceMeters: data.max_walking_distance_meters ?? undefined,
    maxBudget: data.max_budget ?? undefined,
  };
}

export async function pushProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: UserProfile,
): Promise<void> {
  await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name ?? null,
    email: profile.email ?? null,
    needs_accessibility: profile.needsAccessibility ?? false,
    default_priority: profile.defaultPriority ?? 'balanced',
    max_walking_distance_meters: profile.maxWalkingDistanceMeters ?? null,
    max_budget: profile.maxBudget ?? null,
    updated_at: new Date().toISOString(),
  });
}
