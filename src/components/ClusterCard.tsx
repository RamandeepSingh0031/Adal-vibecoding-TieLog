'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Cluster } from '@/lib/db';

interface ClusterCardProps {
  cluster: Cluster;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { name: string; description: string | null }) => void;
}

export function ClusterCard({ cluster, onDelete, onEdit }: ClusterCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(cluster.name);
  const [editDescription, setEditDescription] = useState(cluster.description || '');

  if (isEditing) {
    return (
      <div className="bg-[#141419] border border-[#14B8A6] rounded-xl p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onEdit(cluster.id, { name: editName, description: editDescription || null });
            setIsEditing(false);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#14B8A6]"
            autoFocus
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-lg text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-1.5 text-sm bg-[#14B8A6] text-[#0A0A0F] rounded-lg hover:bg-[#2DD4BF]">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-1.5 text-sm bg-[#2A2A35] text-[#F4F4F5] rounded-lg hover:bg-[#3A3A45]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group relative bg-[#141419] border border-[#2A2A35] rounded-xl p-5 transition-all duration-200 hover:border-[#14B8A6] hover:shadow-lg">
      <Link href={`/cluster/${cluster.id}`} className="block">
        <h3 className="text-lg font-semibold text-gray-100 mb-1">
          {cluster.name}
        </h3>
        {cluster.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {cluster.description}
          </p>
        )}
        <time className="text-xs text-gray-500 mt-3 block">
          {new Date(cluster.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setIsEditing(true);
        }}
        className="absolute top-4 right-10 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-[#14B8A6]"
        aria-label="Edit cluster"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          setShowDelete(!showDelete);
        }}
        className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
        aria-label="Delete cluster"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {showDelete && (
        <div className="absolute top-12 right-4 bg-[#1C1C24] border border-[#2A2A35] rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-gray-300 mb-2">Delete this cluster?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(cluster.id)}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-3 py-1 text-xs bg-[#2A2A35] text-gray-300 rounded hover:bg-[#3A3A45]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
