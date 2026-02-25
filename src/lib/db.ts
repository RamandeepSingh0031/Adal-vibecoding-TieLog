import Dexie, { type Table } from 'dexie';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  created_at: string;
  synced?: boolean;
}

export interface Cluster {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  synced?: boolean;
}

export interface Organization {
  id: string;
  cluster_id: string;
  name: string;
  created_at: string;
  synced?: boolean;
}

export interface Person {
  id: string;
  organization_id: string;
  name: string;
  role: string | null;
  created_at: string;
  synced?: boolean;
}

export interface Note {
  id: string;
  cluster_id: string | null;
  organization_id: string | null;
  person_id: string | null;
  content: string;
  audio_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  synced?: boolean;
}

export interface SyncItem {
  id?: number;
  table: 'profiles' | 'clusters' | 'organizations' | 'people' | 'notes';
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  user_id: string;
  timestamp: Date;
}

class LogbookDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  clusters!: Table<Cluster, string>;
  organizations!: Table<Organization, string>;
  people!: Table<Person, string>;
  notes!: Table<Note, string>;
  syncQueue!: Table<SyncItem, number>;

  constructor() {
    super('LogbookDB');
    this.version(2).stores({
      profiles: 'id, email, created_at',
      clusters: 'id, user_id, name, created_at',
      organizations: 'id, cluster_id, name, created_at',
      people: 'id, organization_id, name, created_at',
      notes: 'id, cluster_id, organization_id, person_id, created_at',
      syncQueue: '++id, table, action, user_id, timestamp',
    });
  }
}

export const db = new LogbookDatabase();

export async function addToSyncQueue(
  table: SyncItem['table'],
  action: SyncItem['action'],
  data: Record<string, unknown>,
  userId: string
) {
  await db.syncQueue.add({
    table,
    action,
    data,
    user_id: userId,
    timestamp: new Date(),
  });
}

export async function getPendingSyncItems() {
  return await db.syncQueue.toArray();
}

export async function clearSyncQueue() {
  await db.syncQueue.clear();
}
