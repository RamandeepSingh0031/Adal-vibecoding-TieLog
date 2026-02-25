'use client';

import { useState, useEffect } from 'react';
import { type Note, type Organization, type Person, db } from '@/lib/db';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { content: string; tags: string[] | null }) => void;
}

export function NoteCard({ note, onDelete, onEdit }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags?.join(', ') || '');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const hasAudio = !!note.audio_url;
  const isLongContent = note.content.length > 300;

  useEffect(() => {
    const loadRelated = async () => {
      if (note.organization_id) {
        const org = await db.organizations.get(note.organization_id);
        setOrganization(org || null);
      }
      if (note.person_id) {
        const p = await db.people.get(note.person_id);
        setPerson(p || null);
      }
    };
    loadRelated();
  }, [note.organization_id, note.person_id]);

  return (
    <>
      <article
        onClick={() => setIsExpanded(true)}
        className="group relative bg-[#2D2D2D] border border-[#4A4A4A] rounded-xl p-5 transition-all duration-200 hover:border-[#14B8A6] cursor-pointer shadow-md hover:shadow-xl"
      >
        <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
          {organization && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {organization.name}
            </span>
          )}
          {person && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {person.name}
            </span>
          )}
        </div>

        <div className={`text-sm text-gray-200 whitespace-pre-wrap ${!isExpanded && isLongContent ? 'line-clamp-6' : ''}`}>
          {note.content}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#4A4A4A]">
          <time className="text-xs text-zinc-400">
            {new Date(note.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>

          <div className="flex items-center gap-2">
            {hasAudio && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                Audio
              </span>
            )}
            {isLongContent && (
              <span className="text-xs text-zinc-400">Read more</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-[#14B8A6]"
              aria-label="Edit note"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
              aria-label="Delete note"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-[#2D2D2D] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-[#3E3E3E] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#F4F4F5] mb-4">Edit Note</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEdit(note.id, {
                  content: editContent,
                  tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : null,
                });
                setIsEditing(false);
              }}
              className="space-y-4"
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-[#1C1C24] border border-[#3E3E3E] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#14B8A6] resize-none"
              />
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full px-4 py-2 bg-[#1C1C24] border border-[#3E3E3E] rounded-lg text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#14B8A6] text-[#0A0A0F] rounded-lg font-medium hover:bg-[#2DD4BF]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-[#3E3E3E] text-[#F4F4F5] rounded-lg font-medium hover:bg-[#4E4E4E]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for expanded note view */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-[#2D2D2D] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-[#3E3E3E] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <time className="text-xs text-zinc-400">
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-gray-200 whitespace-pre-wrap">
              {note.content}
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-[#4A4A4A]">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {hasAudio && (
              <div className="mt-4 pt-4 border-t border-[#4A4A4A]">
                <audio src={note.audio_url!} controls className="w-full" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
