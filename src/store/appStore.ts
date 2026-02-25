import { create } from 'zustand';
import { db, type Cluster, type Organization, type Person, type Note, type Profile, addToSyncQueue } from '@/lib/db';
import { syncToSupabase } from '@/lib/sync';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  user: Profile | null;
  userId: string | null;
  clusters: Cluster[];
  organizations: Organization[];
  people: Person[];
  notes: Note[];
  selectedClusterId: string | null;
  isOnline: boolean;
  isLoading: boolean;

  setUser: (user: Profile | null) => void;
  setUserId: (userId: string | null) => void;
  setOnlineStatus: (online: boolean) => void;
  loadClusters: () => Promise<void>;
  addCluster: (name: string, description?: string) => Promise<Cluster>;
  updateCluster: (id: string, data: Partial<Cluster>) => Promise<void>;
  deleteCluster: (id: string) => Promise<void>;

  loadOrganizations: (clusterId: string) => Promise<void>;
  addOrganization: (clusterId: string, name: string) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  loadPeople: (organizationId: string) => Promise<void>;
  addPerson: (organizationId: string, name: string, role?: string) => Promise<Person>;
  updatePerson: (id: string, data: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;

  loadNotes: (clusterId?: string) => Promise<void>;
  addNote: (data: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'synced'>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  setSelectedCluster: (id: string | null) => void;
  clearUserData: () => void;
}

type ClusterRecord = Cluster & Record<string, unknown>;

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  userId: null,
  clusters: [],
  organizations: [],
  people: [],
  notes: [],
  selectedClusterId: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isLoading: false,

  setUser: (user) => set({ user, userId: user?.id || null }),
  setUserId: (userId) => set({ userId }),
  setOnlineStatus: (online) => set({ isOnline: online }),

  clearUserData: () => set({
    user: null,
    userId: null,
    clusters: [],
    organizations: [],
    people: [],
    notes: [],
    selectedClusterId: null,
  }),

  loadClusters: async () => {
    const { userId } = get();
    set({ isLoading: true });

    try {
      // Load all clusters and filter in JS (handles old data without user_id)
      const allClusters = await db.clusters
        .orderBy('created_at')
        .reverse()
        .toArray();

      console.log('Loading clusters:', { total: allClusters.length, userId });

      // Filter by userId if available, otherwise show all (for migrated data)
      const clusters = userId
        ? allClusters.filter(c => c.user_id === userId || !c.user_id)
        : allClusters;

      console.log('Filtered clusters:', clusters.length);
      set({ clusters, isLoading: false });
    } catch (err) {
      console.error('Error loading clusters:', err);
      set({ isLoading: false });
    }
  },

  addCluster: async (name, description) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const cluster: Cluster = {
      id: uuidv4(),
      user_id: userId,
      name,
      description: description || null,
      created_at: now,
      updated_at: now,
      synced: false,
    };
    await db.clusters.add(cluster);
    await addToSyncQueue('clusters', 'create', cluster as ClusterRecord, userId);
    set((state) => ({ clusters: [cluster, ...state.clusters] }));
    // Trigger sync to Supabase
    syncToSupabase(userId).catch(console.error);
    return cluster;
  },

  updateCluster: async (id, data) => {
    const { userId } = get();
    if (!userId) return;
    await db.clusters.update(id, { ...data, updated_at: new Date().toISOString(), synced: false });
    await addToSyncQueue('clusters', 'update', { id, ...data }, userId);
    set((state) => ({
      clusters: state.clusters.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  deleteCluster: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await db.clusters.delete(id);
    await db.organizations.where('cluster_id').equals(id).delete();
    await db.notes.where('cluster_id').equals(id).delete();
    await addToSyncQueue('clusters', 'delete', { id }, userId);
    set((state) => ({
      clusters: state.clusters.filter((c) => c.id !== id),
      organizations: state.organizations.filter((o) => o.cluster_id !== id),
      notes: state.notes.filter((n) => n.cluster_id !== id),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  loadOrganizations: async (clusterId) => {
    const orgs = await db.organizations.where('cluster_id').equals(clusterId).toArray();
    set({ organizations: orgs });
  },

  addOrganization: async (clusterId, name) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');
    const org: Organization = {
      id: uuidv4(),
      cluster_id: clusterId,
      name,
      created_at: new Date().toISOString(),
      synced: false,
    };
    await db.organizations.add(org);
    await addToSyncQueue('organizations', 'create', { ...org, user_id: userId }, userId);
    set((state) => ({ organizations: [...state.organizations, org] }));
    syncToSupabase(userId).catch(console.error);
    return org;
  },

  updateOrganization: async (id, data) => {
    const { userId } = get();
    if (!userId) return;
    await db.organizations.update(id, { ...data, synced: false });
    await addToSyncQueue('organizations', 'update', { id, ...data }, userId);
    set((state) => ({
      organizations: state.organizations.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  deleteOrganization: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await db.organizations.delete(id);
    await db.people.where('organization_id').equals(id).delete();
    await addToSyncQueue('organizations', 'delete', { id }, userId);
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== id),
      people: state.people.filter((p) => p.organization_id !== id),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  loadPeople: async (organizationId) => {
    const people = await db.people.where('organization_id').equals(organizationId).toArray();
    set({ people });
  },

  addPerson: async (organizationId, name, role) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');
    const person: Person = {
      id: uuidv4(),
      organization_id: organizationId,
      name,
      role: role || null,
      created_at: new Date().toISOString(),
      synced: false,
    };
    await db.people.add(person);
    await addToSyncQueue('people', 'create', { ...person, user_id: userId }, userId);
    set((state) => ({ people: [...state.people, person] }));
    syncToSupabase(userId).catch(console.error);
    return person;
  },

  updatePerson: async (id, data) => {
    const { userId } = get();
    if (!userId) return;
    await db.people.update(id, { ...data, synced: false });
    await addToSyncQueue('people', 'update', { id, ...data }, userId);
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  deletePerson: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await db.people.delete(id);
    await addToSyncQueue('people', 'delete', { id }, userId);
    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  loadNotes: async (clusterId) => {
    let notes: Note[];
    if (clusterId) {
      notes = await db.notes.where('cluster_id').equals(clusterId).reverse().sortBy('created_at');
    } else {
      notes = await db.notes.orderBy('created_at').reverse().toArray();
    }
    set({ notes });
  },

  addNote: async (data) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const note: Note = {
      id: uuidv4(),
      ...data,
      created_at: now,
      updated_at: now,
      synced: false,
    };
    await db.notes.add(note);
    await addToSyncQueue('notes', 'create', { ...note, user_id: userId }, userId);
    set((state) => ({ notes: [note, ...state.notes] }));
    syncToSupabase(userId).catch(console.error);
    return note;
  },

  updateNote: async (id, data) => {
    const { userId } = get();
    if (!userId) return;
    await db.notes.update(id, { ...data, updated_at: new Date().toISOString(), synced: false });
    await addToSyncQueue('notes', 'update', { id, ...data }, userId);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  deleteNote: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await db.notes.delete(id);
    await addToSyncQueue('notes', 'delete', { id }, userId);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
    syncToSupabase(userId).catch(console.error);
  },

  setSelectedCluster: (id) => set({ selectedClusterId: id }),
}));
