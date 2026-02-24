'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';

export default function ClusterPage() {
  const params = useParams();
  const router = useRouter();
  const clusterId = params.id as string;

  const {
    clusters,
    organizations,
    people,
    notes,
    loadClusters,
    loadOrganizations,
    loadPeople,
    loadNotes,
    addOrganization,
    addPerson,
    addNote,
    deleteOrganization,
    deletePerson,
    deleteNote,
  } = useAppStore();

  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const cluster = clusters.find((c) => c.id === clusterId);

  useEffect(() => {
    loadClusters();
    loadOrganizations(clusterId);
    loadNotes(clusterId);
  }, [clusterId, loadClusters, loadOrganizations, loadNotes]);

  useEffect(() => {
    if (selectedOrgId) {
      loadPeople(selectedOrgId);
    }
  }, [selectedOrgId, loadPeople]);

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    await addOrganization(clusterId, newOrgName);
    setNewOrgName('');
    setShowOrgForm(false);
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim() || !selectedOrgId) return;
    await addPerson(selectedOrgId, newPersonName, newPersonRole || undefined);
    setNewPersonName('');
    setNewPersonRole('');
    setShowPersonForm(false);
  };

  const handleAddNote = async (data: { content: string; cluster_id: string; person_id?: string; organization_id?: string; tags: string[] | null; audio_url: string | null }) => {
    await addNote(data);
  };

  if (!cluster) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Cluster not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clusters
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {cluster.name}
          </h1>
          {cluster.description && (
            <p className="text-zinc-500 dark:text-zinc-400">{cluster.description}</p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="lg:col-span-1 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Organizations
                </h2>
                <button
                  onClick={() => setShowOrgForm(!showOrgForm)}
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  + Add
                </button>
              </div>

              {showOrgForm && (
                <form onSubmit={handleAddOrg} className="mb-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full py-1.5 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </form>
              )}

              {organizations.length === 0 ? (
                <p className="text-sm text-zinc-400">No organizations yet</p>
              ) : (
                <ul className="space-y-2">
                  {organizations.map((org) => (
                    <li key={org.id}>
                      <button
                        onClick={() => setSelectedOrgId(org.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedOrgId === org.id
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {org.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {selectedOrgId && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                    People
                  </h2>
                  <button
                    onClick={() => setShowPersonForm(!showPersonForm)}
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    + Add
                  </button>
                </div>

                {showPersonForm && (
                  <form onSubmit={handleAddPerson} className="mb-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="Person name"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newPersonRole}
                      onChange={(e) => setNewPersonRole(e.target.value)}
                      placeholder="Role (optional)"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-800"
                    >
                      Add
                    </button>
                  </form>
                )}

                {people.length === 0 ? (
                  <p className="text-sm text-zinc-400">No people yet</p>
                ) : (
                  <ul className="space-y-1">
                    {people.map((person) => (
                      <li
                        key={person.id}
                        className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {person.name}
                        {person.role && (
                          <span className="text-zinc-400 text-xs ml-1">({person.role})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </aside>

          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                New Note
              </h2>
              <NoteEditor
                clusterId={clusterId}
                people={people}
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                onSave={handleAddNote}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                Timeline
              </h2>
              {notes.length === 0 ? (
                <p className="text-zinc-400 text-sm">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
