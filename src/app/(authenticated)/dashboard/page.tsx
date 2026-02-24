'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { db, type Cluster } from '@/lib/db';

export default function DashboardPage() {
  const { userId, addCluster } = useAppStore();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterDesc, setNewClusterDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClusters = async () => {
      if (!userId) return;

      try {
        const userClusters = await db.clusters
          .where('user_id')
          .equals(userId)
          .reverse()
          .sortBy('created_at');
        setClusters(userClusters);
      } catch (err) {
        console.error('Error loading clusters:', err);
      } finally {
        setIsLoading(false);
      }
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#71717A]">Please sign in to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#F4F4F5] mb-1">
              Your Clusters
            </h1>
            <p className="text-[#71717A] text-sm">
              Organize your relationships by group
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14B8A6] text-[#0A0A0F] rounded-xl font-medium hover:bg-[#0D9488] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Cluster
          </button>
        </div>

        {/* Clusters Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-[#71717A]">Loading...</div>
          </div>
        ) : clusters.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {clusters.map((cluster) => (
              <Link
                key={cluster.id}
                href={`/cluster/${cluster.id}`}
                className="group p-6 bg-[#141419] border border-[#2A2A35] rounded-2xl hover:border-[#14B8A6]/30 transition-all hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F472B6]/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F472B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-[#71717A] group-hover:text-[#14B8A6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#F4F4F5] mb-1 group-hover:text-[#14B8A6] transition-colors">
                  {cluster.name}
                </h3>
                {cluster.description && (
                  <p className="text-sm text-[#71717A] line-clamp-2">
                    {cluster.description}
                  </p>
                )}
                <p className="text-xs text-[#52525B] mt-3">
                  Created {new Date(cluster.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#141419] border border-[#2A2A35] rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#14B8A6]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F4F4F5] mb-2">No clusters yet</h3>
            <p className="text-[#71717A] mb-6 max-w-sm mx-auto">
              Create your first cluster to start organizing your relationships
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14B8A6] text-[#0A0A0F] rounded-xl font-medium hover:bg-[#0D9488] transition-colors"
            >
              Create your first cluster
            </button>
          </div>
        )}

        {/* Create Cluster Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-md bg-[#141419] border border-[#2A2A35] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#F4F4F5] mb-4">Create New Cluster</h3>
              <form onSubmit={handleCreateCluster} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                    Cluster Name
                  </label>
                  <input
                    type="text"
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    placeholder="e.g., Work, Friends, Family"
                    className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newClusterDesc}
                    onChange={(e) => setNewClusterDesc(e.target.value)}
                    placeholder="What's this cluster for?"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isCreating || !newClusterName.trim()}
                    className="flex-1 px-4 py-3 bg-[#14B8A6] text-[#0A0A0F] rounded-xl font-medium hover:bg-[#0D9488] transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Cluster'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-3 bg-[#2A2A35] text-[#F4F4F5] rounded-xl font-medium hover:bg-[#3A3A45] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
