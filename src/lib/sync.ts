import { supabase } from './supabase';
import { db, getPendingSyncItems, clearSyncQueue, type Cluster, type Organization, type Person, type Note, type Profile } from './db';

export async function syncToSupabase(userId: string) {
  const pendingItems = await getPendingSyncItems();
  const userItems = pendingItems.filter(item => item.user_id === userId);
  
  if (userItems.length === 0) {
    console.log('No items to sync');
    return;
  }

  console.log(`Syncing ${userItems.length} items for user ${userId}...`);

  for (const item of userItems) {
    try {
      await syncItem(item.table, item.action, item.data, userId);
      console.log(`Synced: ${item.table} - ${item.action}`);
    } catch (error) {
      console.error(`Failed to sync ${item.table}:`, error);
    }
  }

  // Clear only synced items
  const syncedIds = userItems.map(i => i.id).filter(id => id !== undefined);
  if (syncedIds.length > 0) {
    await db.syncQueue.bulkDelete(syncedIds as number[]);
  }
  console.log('Sync complete');
}

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
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
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
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        description: data.description,
        created_at: data.created_at,
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
        id: data.id,
        cluster_id: data.cluster_id,
        name: data.name,
        created_at: data.created_at,
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
        id: data.id,
        organization_id: data.organization_id,
        name: data.name,
        role: data.role,
        created_at: data.created_at,
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
        id: data.id,
        cluster_id: data.cluster_id,
        organization_id: data.organization_id,
        person_id: data.person_id,
        content: data.content,
        audio_url: data.audio_url,
        tags: data.tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
      break;
    case 'delete':
      await supabase.from('notes').delete().eq('id', data.id);
      break;
  }
}

export function setupOnlineListener(onOnline: () => void, onOffline: () => void) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export async function fetchFromSupabase(userId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !userId) return;

  const { data: clusters } = await supabase
    .from('clusters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: organizations } = await supabase
    .from('organizations')
    .select('*');

  const { data: people } = await supabase
    .from('people')
    .select('*');

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (clusters) {
    for (const cluster of clusters) {
      await db.clusters.put({ ...cluster, synced: true });
    }
  }

  if (organizations) {
    for (const org of organizations) {
      await db.organizations.put({ ...org, synced: true });
    }
  }

  if (people) {
    for (const person of people) {
      await db.people.put({ ...person, synced: true });
    }
  }

  if (notes) {
    for (const note of notes) {
      await db.notes.put({ ...note, synced: true });
    }
  }

  console.log('Fetched from Supabase:', { clusters: clusters?.length, organizations: organizations?.length, people: people?.length, notes: notes?.length });
}
