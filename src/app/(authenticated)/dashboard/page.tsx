'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { db, type Cluster } from '@/lib/db';
import { ClusterCard } from '@/components/ClusterCard';

export default function DashboardPage() {
  const { userId, addCluster, updateCluster, deleteCluster } = useAppStore();
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
      <div className="min-h-screen bg-[#3E3E3E] flex items-center justify-center">
        <div className="text-[#A1A1AA]">Please sign in to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3E3E3E] selection:bg-[#14B8A6]/30">
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        {/* Hero Section on Canvas */}
        <div className="mb-16">
          <h1 className="text-4xl font-light text-[#F4F4F5] tracking-tight mb-3">
            Your Clusters
          </h1>
          <p className="text-[#71717A] text-lg max-w-xl">
            A quiet space to organize your relationships and map the details that matter.
          </p>
        </div>

        {/* Action Bar */}
        {!isLoading && clusters.length > 0 && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowCreateForm(true)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-[#14B8A6] text-[#0A0A0F] rounded-2xl font-semibold hover:bg-[#2DD4BF] transition-all shadow-[0_4px_20px_rgba(20,184,166,0.2)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.35)] active:scale-95"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Cluster</span>
            </button>
          </div>
        )}

        {/* Clusters Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#14B8A6]/20 border-t-[#14B8A6] rounded-full animate-spin"></div>
            <div className="text-[#71717A] font-medium animate-pulse">Consulting your memories...</div>
          </div>
        ) : clusters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onDelete={deleteCluster}
                onEdit={updateCluster}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-[#2D2D2D]/50 border-2 border-dashed border-[#4A4A4A] rounded-[40px] px-8 text-center max-w-2xl mx-auto backdrop-blur-sm">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#14B8A6] blur-[40px] opacity-10 animate-pulse"></div>
              <div className="relative w-24 h-24 mx-auto rounded-3xl bg-[#14B8A6]/10 flex items-center justify-center border border-[#14B8A6]/20">
                <svg className="w-12 h-12 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-[#F4F4F5] mb-3">Your canvas is empty</h3>
            <p className="text-[#71717A] mb-10 text-lg leading-relaxed">
              Start mapping your network by creating your first cluster of people and organizations.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-[#F4F4F5] text-[#0A0A0F] rounded-2xl font-bold hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.1)]"
            >
              Start Your First Cluster
            </button>
          </div>
        )}

        {/* Create Cluster Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#2D2D2D] border border-[#3E3E3E] rounded-2xl p-6 shadow-2xl">
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
                    className="w-full px-4 py-3 bg-[#3E3E3E] border border-[#4A4A4A] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] transition-colors"
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
                    className="w-full px-4 py-3 bg-[#3E3E3E] border border-[#4A4A4A] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] resize-none transition-colors"
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
