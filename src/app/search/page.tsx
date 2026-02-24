'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { db } from '@/lib/db';

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
  const [isSearching, setIsSearching] = useState(false);
  const { userId } = useAppStore();

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

      // Search clusters (filtered by userId)
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

      // Search organizations (via clusters)
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

      // Search people (via orgs)
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

      // Search notes (via clusters)
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

      // Only update if query hasn't changed
      if (queryRef.current === currentQuery) {
        setResults(allResults);
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, userId]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          Search
        </h1>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clusters, organizations, people, notes..."
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            autoFocus
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isSearching && (
          <p className="text-zinc-400 text-sm mt-4">Searching...</p>
        )}

        {results.length > 0 && (
          <ul className="mt-6 space-y-2">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <Link
                  href={result.link}
                  className="block p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      result.type === 'cluster' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      result.type === 'organization' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      result.type === 'person' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {result.title}
                  </h3>
                  {result.subtitle && (
                    <p className="text-sm text-zinc-500 mt-1">{result.subtitle}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query && !isSearching && results.length === 0 && (
          <p className="text-zinc-400 text-sm mt-4">No results found</p>
        )}
      </div>
    </main>
  );
}
