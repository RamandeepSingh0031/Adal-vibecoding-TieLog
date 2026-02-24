'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { ClusterCard } from '@/components/ClusterCard';

export default function Home() {
  const { user, isLoading: authLoading, userId } = useAuth();
  const { clusters, loadClusters, addCluster, deleteCluster, isLoading } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterDesc, setNewClusterDesc] = useState('');

  useEffect(() => {
    if (!authLoading) {
      loadClusters();
    }
  }, [userId, authLoading, loadClusters]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Redirecting to sign in...</div>
      </main>
    );
  }

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterName.trim()) return;
    
    await addCluster(newClusterName, newClusterDesc);
    setNewClusterName('');
    setNewClusterDesc('');
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              The Logbook
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Your offline-first private journal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadClusters()}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              aria-label="Refresh"
              title="Refresh clusters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Link
              href="/search"
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button
              onClick={async () => {
                const { signOut } = await import('@/lib/auth');
                await signOut();
              }}
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Clusters
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {showForm ? 'Cancel' : 'New Cluster'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateCluster} className="mb-8 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    placeholder="Cluster name (e.g., South Asia Trip)"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                    autoFocus
                  />
                </div>
                <div>
                  <textarea
                    value={newClusterDesc}
                    onChange={(e) => setNewClusterDesc(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newClusterName.trim()}
                  className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  Create Cluster
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">
              Loading clusters...
            </div>
          ) : clusters.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-zinc-400 dark:text-zinc-500 mb-4">
                No clusters yet. Create your first one!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Create Cluster
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {clusters.map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  onDelete={deleteCluster}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
