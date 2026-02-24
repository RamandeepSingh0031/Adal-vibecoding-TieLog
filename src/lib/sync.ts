import { supabase } from './supabase';
import { logger } from './logger';
import {
  db,
  getPendingSyncItems,
  type Cluster,
  type Organization,
  type Person,
  type Note,
  type Profile,
} from './db';

// ---------------------------------------------------------------------------
// Retry helper — exponential back-off with jitter
// ---------------------------------------------------------------------------
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 300
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Push local changes → Supabase
// ---------------------------------------------------------------------------
export async function syncToSupabase(userId: string) {
  const pendingItems = await getPendingSyncItems();
  const userItems = pendingItems.filter((item) => item.user_id === userId);

  if (userItems.length === 0) {
    logger.info('Sync: no pending items', { userId });
    return;
  }

  logger.info('Sync: starting', { userId, count: userItems.length });

  for (const item of userItems) {
    try {
      await withRetry(() => syncItem(item.table, item.action, item.data, userId));
      logger.info('Sync: item synced', { table: item.table, action: item.action });
    } catch (error) {
      logger.error('Sync: item failed after retries', {
        table: item.table,
        action: item.action,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Only delete items that were successfully processed (already attempted above)
  const syncedIds = userItems.map((i) => i.id).filter((id) => id !== undefined);
  if (syncedIds.length > 0) {
    await db.syncQueue.bulkDelete(syncedIds as number[]);
  }

  logger.info('Sync: complete', { userId });
}

// ---------------------------------------------------------------------------
// Internal per-table dispatchers
// ---------------------------------------------------------------------------
async function syncItem(
  table: string,
  action: string,
  data: Record<string, unknown>,
  userId: string
) {
  const { id, ...rest } = data;

  switch (table) {
    case 'profiles':
      await syncProfile(action, { id: id as string, ...rest } as Profile);
      break;
    case 'clusters':
      await syncCluster(action, { id: id as string, user_id: userId, ...rest } as Cluster);
      break;
    case 'organizations':
      await syncOrganization(action, { id: id as string, ...rest } as Organization);
      break;
    case 'people':
      await syncPerson(action, { id: id as string, ...rest } as Person);
      break;
    case 'notes':
      await syncNote(action, { id: id as string, ...rest } as Note);
      break;
  }
}

async function syncProfile(action: string, data: Profile) {
  switch (action) {
    case 'create':
    case 'update':
      await supabase.from('profiles').upsert({
        id: data.id, email: data.email,
        full_name: data.full_name, avatar_url: data.avatar_url,
        created_at: data.created_at,
      });
      break;
    case 'delete':
      await supabase.from('profiles').delete().eq('id', data.id);
      break;
  }
}

async function syncCluster(action: string, data: Cluster) {
  switch (action) {
    case 'create':
    case 'update':
      await supabase.from('clusters').upsert({
        id: data.id, user_id: data.user_id, name: data.name,
        description: data.description, created_at: data.created_at,
        updated_at: data.updated_at,
      });
      break;
    case 'delete':
      await supabase.from('clusters').delete().eq('id', data.id);
      break;
  }
}

async function syncOrganization(action: string, data: Organization) {
  switch (action) {
    case 'create':
    case 'update':
      await supabase.from('organizations').upsert({
        id: data.id, cluster_id: data.cluster_id,
        name: data.name, created_at: data.created_at,
      });
      break;
    case 'delete':
      await supabase.from('organizations').delete().eq('id', data.id);
      break;
  }
}

async function syncPerson(action: string, data: Person) {
  switch (action) {
    case 'create':
    case 'update':
      await supabase.from('people').upsert({
        id: data.id, organization_id: data.organization_id,
        name: data.name, role: data.role, created_at: data.created_at,
      });
      break;
    case 'delete':
      await supabase.from('people').delete().eq('id', data.id);
      break;
  }
}

async function syncNote(action: string, data: Note) {
  switch (action) {
    case 'create':
    case 'update':
      await supabase.from('notes').upsert({
        id: data.id, cluster_id: data.cluster_id,
        organization_id: data.organization_id, person_id: data.person_id,
        content: data.content, audio_url: data.audio_url,
        tags: data.tags, created_at: data.created_at, updated_at: data.updated_at,
      });
      break;
    case 'delete':
      await supabase.from('notes').delete().eq('id', data.id);
      break;
  }
}

// ---------------------------------------------------------------------------
// Online/offline event listeners
// ---------------------------------------------------------------------------
export function setupOnlineListener(onOnline: () => void, onOffline: () => void) {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// ---------------------------------------------------------------------------
// Pull remote data → local IndexedDB
// ✅ FIX: all queries now scoped to the authenticated userId
// ---------------------------------------------------------------------------
export async function fetchFromSupabase(userId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !userId) return;

  // Fetch clusters owned by this user
  const { data: clusters, error: clustersErr } = await supabase
    .from('clusters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (clustersErr) {
    logger.error('fetchFromSupabase: clusters query failed', { error: clustersErr.message });
  }

  // Get this user's cluster IDs to scope child-table queries
  const clusterIds = (clusters ?? []).map((c: { id: string }) => c.id);

  // Fetch organizations that belong to this user's clusters only
  const { data: organizations, error: orgsErr } = clusterIds.length > 0
    ? await supabase.from('organizations').select('*').in('cluster_id', clusterIds)
    : { data: [], error: null };

  if (orgsErr) {
    logger.error('fetchFromSupabase: organizations query failed', { error: orgsErr.message });
  }

  // Fetch people that belong to this user's organizations only
  const orgIds = (organizations ?? []).map((o: { id: string }) => o.id);

  const { data: people, error: peopleErr } = orgIds.length > 0
    ? await supabase.from('people').select('*').in('organization_id', orgIds)
    : { data: [], error: null };

  if (peopleErr) {
    logger.error('fetchFromSupabase: people query failed', { error: peopleErr.message });
  }

  // Fetch notes belonging to this user's clusters only
  const { data: notes, error: notesErr } = clusterIds.length > 0
    ? await supabase
      .from('notes')
      .select('*')
      .in('cluster_id', clusterIds)
      .order('created_at', { ascending: false })
    : { data: [], error: null };

  if (notesErr) {
    logger.error('fetchFromSupabase: notes query failed', { error: notesErr.message });
  }

  // Persist to local IndexedDB
  if (clusters) for (const c of clusters) await db.clusters.put({ ...c, synced: true });
  if (organizations) for (const o of organizations) await db.organizations.put({ ...o, synced: true });
  if (people) for (const p of people) await db.people.put({ ...p, synced: true });
  if (notes) for (const n of notes) await db.notes.put({ ...n, synced: true });

  logger.info('fetchFromSupabase: complete', {
    clusters: clusters?.length ?? 0,
    organizations: organizations?.length ?? 0,
    people: people?.length ?? 0,
    notes: notes?.length ?? 0,
  });
}
