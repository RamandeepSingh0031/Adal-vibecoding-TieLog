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
    updateNote,
    updateOrganization,
    updatePerson,
  } = useAppStore();

  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState('');
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonRole, setEditPersonRole] = useState('');

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

  const handleEditOrg = async (orgId: string) => {
    if (!editOrgName.trim()) return;
    await updateOrganization(orgId, { name: editOrgName });
    setEditingOrgId(null);
    setEditOrgName('');
  };

  const handleEditPerson = async (personId: string) => {
    if (!editPersonName.trim()) return;
    await updatePerson(personId, { name: editPersonName, role: editPersonRole || null });
    setEditingPersonId(null);
    setEditPersonName('');
    setEditPersonRole('');
  };

  const handleAddNote = async (data: {
    content: string;
    cluster_id: string;
    person_id?: string;
    organization_id?: string;
    tags: string[] | null;
    audio_url: string | null;
  }) => {
    await addNote({
      ...data,
      person_id: data.person_id || null,
      organization_id: data.organization_id || null,
    });
  };

  if (!cluster) {
    return (
      <div className="min-h-screen bg-[#3E3E3E] flex items-center justify-center">
        <p className="text-[#A1A1AA]">Cluster not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#3E3E3E]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#F4F4F5] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clusters
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#F4F4F5] mb-2">
            {cluster.name}
          </h1>
          {cluster.description && (
            <p className="text-[#A1A1AA]">{cluster.description}</p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="lg:col-span-1 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F4F4F5]">
                  Organizations
                </h2>
                <button
                  onClick={() => setShowOrgForm(!showOrgForm)}
                  className="text-sm text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
                >
                  + Add
                </button>
              </div>

              {showOrgForm && (
                <form onSubmit={handleAddOrg} className="mb-3 p-3 bg-[#2D2D2D] border border-[#4A4A4A] rounded-lg shadow-lg">
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full px-3 py-2 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded-lg text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] transition-colors"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full py-1.5 text-sm bg-[#14B8A6] text-[#0A0A0F] font-medium rounded-lg hover:bg-[#2DD4BF] transition-colors"
                  >
                    Add
                  </button>
                </form>
              )}

              {organizations.length === 0 ? (
                <p className="text-sm text-[#71717A]">No organizations yet</p>
              ) : (
                <ul className="space-y-2">
                  {organizations.map((org) => (
                    <li key={org.id} className="flex items-center gap-2">
                      {editingOrgId === org.id ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleEditOrg(org.id); }}
                          className="flex-1 flex gap-1"
                        >
                          <input
                            type="text"
                            value={editOrgName}
                            onChange={(e) => setEditOrgName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded text-[#F4F4F5] focus:outline-none focus:border-[#14B8A6]"
                            autoFocus
                          />
                          <button type="submit" className="p-1 text-[#14B8A6] hover:bg-[#14B8A6]/20 rounded">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button type="button" onClick={() => setEditingOrgId(null)} className="p-1 text-zinc-400 hover:bg-[#3E3E3E] rounded">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedOrgId(org.id)}
                            className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedOrgId === org.id
                              ? 'bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30'
                              : 'hover:bg-[#2D2D2D] text-[#A1A1AA] hover:text-[#F4F4F5]'
                              }`}
                          >
                            {org.name}
                          </button>
                          <button
                            onClick={() => { setEditingOrgId(org.id); setEditOrgName(org.name); }}
                            className="p-1 text-zinc-500 hover:text-[#14B8A6]"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => deleteOrganization(org.id)}
                            className="p-1 text-zinc-500 hover:text-red-500"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {selectedOrgId && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#F4F4F5]">
                    People
                  </h2>
                  <button
                    onClick={() => setShowPersonForm(!showPersonForm)}
                    className="text-sm text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {showPersonForm && (
                  <form onSubmit={handleAddPerson} className="mb-3 p-3 bg-[#2D2D2D] border border-[#4A4A4A] rounded-lg space-y-2 shadow-lg">
                    <input
                      type="text"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="Person name"
                      className="w-full px-3 py-2 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded-lg text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] transition-colors"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newPersonRole}
                      onChange={(e) => setNewPersonRole(e.target.value)}
                      placeholder="Role (optional)"
                      className="w-full px-3 py-2 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded-lg text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6] transition-colors"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 text-sm bg-[#14B8A6] text-[#0A0A0F] font-medium rounded-lg hover:bg-[#2DD4BF] transition-colors"
                    >
                      Add
                    </button>
                  </form>
                )}

                {people.length === 0 ? (
                  <p className="text-sm text-[#71717A]">No people yet</p>
                ) : (
                  <ul className="space-y-1">
                    {people.map((person) => (
                      <li key={person.id} className="flex items-center gap-2 px-3 py-2 text-sm text-[#A1A1AA]">
                        {editingPersonId === person.id ? (
                          <form
                            onSubmit={(e) => { e.preventDefault(); handleEditPerson(person.id); }}
                            className="flex-1 flex gap-1 flex-wrap"
                          >
                            <input
                              type="text"
                              value={editPersonName}
                              onChange={(e) => setEditPersonName(e.target.value)}
                              className="flex-1 min-w-[80px] px-2 py-1 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded text-[#F4F4F5] focus:outline-none focus:border-[#14B8A6]"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editPersonRole}
                              onChange={(e) => setEditPersonRole(e.target.value)}
                              placeholder="Role"
                              className="w-20 px-2 py-1 text-sm bg-[#3E3E3E] border border-[#4A4A4A] rounded text-[#F4F4F5] focus:outline-none focus:border-[#14B8A6]"
                            />
                            <button type="submit" className="p-1 text-[#14B8A6] hover:bg-[#14B8A6]/20 rounded">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button type="button" onClick={() => setEditingPersonId(null)} className="p-1 text-zinc-400 hover:bg-[#3E3E3E] rounded">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="flex-1">
                              {person.name}
                              {person.role && (
                                <span className="text-[#71717A] text-xs ml-1">({person.role})</span>
                              )}
                            </span>
                            <button
                              onClick={() => { setEditingPersonId(person.id); setEditPersonName(person.name); setEditPersonRole(person.role || ''); }}
                              className="p-1 text-zinc-500 hover:text-[#14B8A6]"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                              onClick={() => deletePerson(person.id)}
                              className="p-1 text-zinc-500 hover:text-red-500"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
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
              <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
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
              <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
                Timeline
              </h2>
              {notes.length === 0 ? (
                <p className="text-[#71717A] text-sm">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={deleteNote}
                      onEdit={updateNote}
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
