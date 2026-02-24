'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Note, type Person, type Organization } from '@/lib/db';

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  person_id: z.string().optional(),
  organization_id: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  clusterId: string;
  people: Person[];
  organizations: Organization[];
  selectedOrgId: string | null;
  onSave: (data: { content: string; cluster_id: string; person_id?: string; organization_id?: string; tags: string[] | null; audio_url: string | null }) => Promise<void>;
}

export function NoteEditor({ clusterId, people, organizations, selectedOrgId, onSave }: NoteEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Revoke object URLs on change and unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
      person_id: '',
      organization_id: '',
    },
  });

  const watchedOrgId = watch('organization_id');

  // Auto-select organization when sidebar selection changes
  useEffect(() => {
    if (selectedOrgId) {
      setSelectedOrganization(selectedOrgId);
      setValue('organization_id', selectedOrgId);
    }
  }, [selectedOrgId, setValue]);

  // Filter people based on selected organization
  const filteredPeople = selectedOrganization
    ? people.filter(p => p.organization_id === selectedOrganization)
    : [];

  const extractTags = (content: string): string[] => {
    const hashtagMatches = content.match(/#\w+/g) || [];
    const mentionMatches = content.match(/@\w+/g) || [];
    return [...hashtagMatches, ...mentionMatches];
  };

  const onSubmit = async (data: NoteFormData) => {
    const tags = extractTags(data.content);
    await onSave({
      content: data.content,
      cluster_id: clusterId,
      person_id: data.person_id || undefined,
      organization_id: data.organization_id || undefined,
      tags: tags.length > 0 ? tags : null,
      audio_url: audioUrl,
    });
    reset();
    setAudioUrl(null);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      // Log recording errors without crashing the UI
      console.warn('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <textarea
          {...register('content')}
          placeholder="Write your note... Use @name for people, #org for organizations"
          className="w-full min-h-[120px] p-4 bg-[#141419] border border-[#2A2A35] rounded-xl resize-none focus:outline-none focus:border-[#14B8A6] text-gray-200 placeholder-gray-500"
          aria-label="Note content"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={selectedOrganization}
          onChange={(e) => {
            setSelectedOrganization(e.target.value);
            setValue('organization_id', e.target.value);
            setValue('person_id', ''); // Reset person when org changes
          }}
          className="px-3 py-2 bg-[#141419] border border-[#2A2A35] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#14B8A6]"
        >
          <option value="">Select organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <select
          {...register('person_id')}
          value={watch('person_id') || ''}
          className="px-3 py-2 bg-[#141419] border border-[#2A2A35] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#14B8A6]"
        >
          <option value="">Select person</option>
          {filteredPeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} {person.role && `(${person.role})`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isRecording
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-[#1C1C24] text-gray-300 hover:bg-[#2A2A35]'
            }`}
        >
          {isRecording ? 'Stop Recording' : '🎤 Record Audio'}
        </button>
      </div>

      {audioUrl && (
        <div className="flex items-center gap-3 p-3 bg-[#1C1C24] rounded-lg">
          <audio src={audioUrl} controls className="flex-1" />
          <button
            type="button"
            onClick={() => setAudioUrl(null)}
            className="text-zinc-400 hover:text-red-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#14B8A6] text-[#0A0A0F] font-medium rounded-xl hover:bg-[#0D9488] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Note'}
      </button>
    </form>
  );
}
