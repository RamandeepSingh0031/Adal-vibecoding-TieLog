'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { db } from '@/lib/db';
import { type Cluster } from '@/lib/db';

interface SearchResult {
  id: string;
  type: 'cluster' | 'organization' | 'person' | 'note';
  title: string;
  subtitle?: string;
  link: string;
}

export default function SearchPage() {
  const queryRef = useRef('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterDesc, setNewClusterDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { userId, addCluster } = useAppStore();

  useEffect(() => {
    const loadClusters = async () => {
      if (!userId) return;
      const userClusters = await db.clusters.where('user_id').equals(userId).toArray();
      setClusters(userClusters);
    };
    loadClusters();
  }, [userId]);

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterName.trim() || !userId) return;

    setIsCreating(true);
    try {
      const cluster = await addCluster(newClusterName, newClusterDesc);
      setClusters(prev => [cluster, ...prev]);
      setNewClusterName('');
      setNewClusterDesc('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating cluster:', err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    const search = async () => {
      const currentQuery = queryRef.current;
      if (!currentQuery.trim() || !userId) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const searchTerm = currentQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      const clusters = await db.clusters.where('user_id').equals(userId).toArray();
      clusters.forEach((cluster) => {
        if (cluster.name.toLowerCase().includes(searchTerm) ||
          cluster.description?.toLowerCase().includes(searchTerm)) {
          allResults.push({
            id: cluster.id,
            type: 'cluster',
            title: cluster.name,
            subtitle: cluster.description || undefined,
            link: `/cluster/${cluster.id}`,
          });
        }
      });

      const clusterIds = clusters.map(c => c.id);
      const orgs = await db.organizations.where('cluster_id').anyOf(clusterIds).toArray();
      const orgMap = new Map(orgs.map(o => [o.id, o]));

      orgs.forEach((org) => {
        if (org.name.toLowerCase().includes(searchTerm)) {
          allResults.push({
            id: org.id,
            type: 'organization',
            title: org.name,
            link: `/cluster/${org.cluster_id}`,
          });
        }
      });

      const orgIds = orgs.map(o => o.id);
      const people = await db.people.where('organization_id').anyOf(orgIds).toArray();

      people.forEach((person) => {
        if (person.name.toLowerCase().includes(searchTerm) ||
          person.role?.toLowerCase().includes(searchTerm)) {
          const org = orgMap.get(person.organization_id);
          allResults.push({
            id: person.id,
            type: 'person',
            title: person.name,
            subtitle: person.role ? `${person.role} @ ${org?.name || ''}` : org?.name,
            link: `/cluster/${org?.cluster_id}`,
          });
        }
      });

      const notes = await db.notes.where('cluster_id').anyOf(clusterIds).toArray();

      notes.forEach((note) => {
        if (note.content.toLowerCase().includes(searchTerm) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))) {
          const cluster = clusters.find(c => c.id === note.cluster_id);
          allResults.push({
            id: note.id,
            type: 'note',
            title: note.content.slice(0, 100) + (note.content.length > 100 ? '...' : ''),
            subtitle: note.tags?.join(', '),
            link: `/cluster/${note.cluster_id}`,
          });
        }
      });

      if (queryRef.current === currentQuery) {
        setResults(allResults);
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, userId]);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#F4F4F5] mb-6">Search</h1>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clusters, organizations, people, notes..."
            className="w-full px-4 py-3 pl-12 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]"
            autoFocus
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isSearching && <p className="text-[#71717A] text-sm mt-4">Searching...</p>}

        {results.length > 0 && (
          <ul className="mt-6 space-y-2">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <Link href={result.link} className="block p-4 bg-[#141419] border border-[#2A2A35] rounded-xl hover:border-[#14B8A6]/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${result.type === 'cluster' ? 'bg-[#F472B6]/15 text-[#F472B6]' :
                        result.type === 'organization' ? 'bg-[#A78BFA]/15 text-[#A78BFA]' :
                          result.type === 'person' ? 'bg-[#60A5FA]/15 text-[#60A5FA]' :
                            'bg-[#71717A]/15 text-[#71717A]'
                      }`}>{result.type}</span>
                  </div>
                  <h3 className="font-medium text-[#F4F4F5]">{result.title}</h3>
                  {result.subtitle && <p className="text-sm text-[#A1A1AA] mt-1">{result.subtitle}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query && !isSearching && results.length === 0 && <p className="text-[#71717A] text-sm mt-4">No results found</p>}

        {!query && clusters.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-[#F4F4F5] mb-4">Your Clusters</h2>
            <div className="space-y-3">
              {clusters.map((cluster) => (
                <Link key={cluster.id} href={`/cluster/${cluster.id}`} className="block p-4 bg-[#141419] border border-[#2A2A35] rounded-xl hover:border-[#14B8A6]/30">
                  <h3 className="font-medium text-[#F4F4F5]">{cluster.name}</h3>
                  {cluster.description && <p className="text-sm text-[#A1A1AA] mt-1">{cluster.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!query && clusters.length === 0 && !isSearching && (
          <div className="mt-8 text-center">
            <p className="text-[#71717A] mb-4">No clusters yet</p>
            <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-[#14B8A6] text-[#0A0A0F] rounded-lg font-medium">
              Create your first cluster
            </button>
          </div>
        )}

        {showCreateForm && (
          <div className="mt-8 p-6 bg-[#141419] border border-[#2A2A35] rounded-xl">
            <h3 className="text-lg font-medium text-[#F4F4F5] mb-4">Create New Cluster</h3>
            <form onSubmit={handleCreateCluster} className="space-y-4">
              <input type="text" value={newClusterName} onChange={(e) => setNewClusterName(e.target.value)} placeholder="Cluster name" className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]" autoFocus />
              <input type="text" value={newClusterDesc} onChange={(e) => setNewClusterDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]" />
              <div className="flex gap-3">
                <button type="submit" disabled={isCreating || !newClusterName.trim()} className="px-4 py-2 bg-[#14B8A6] text-[#0A0A0F] rounded-lg font-medium hover:bg-[#0D9488] disabled:opacity-50">
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-[#2A2A35] text-[#F4F4F5] rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
