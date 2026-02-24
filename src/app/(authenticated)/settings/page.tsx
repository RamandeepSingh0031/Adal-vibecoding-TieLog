'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { updateProfile } from '@/lib/auth';

export default function SettingsPage() {
  const { user } = useAppStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#F4F4F5] mb-8">Settings</h1>

        <div className="space-y-8">
          <section className="bg-[#141419] border border-[#2A2A35] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-[#F4F4F5] mb-4">Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#71717A] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[#1C1C24] border border-[#2A2A35] rounded-xl text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#14B8A6]"
                />
              </div>
              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-[#14B8A6]/10 text-[#14B8A6]' : 'bg-[#F472B6]/10 text-[#F472B6]'
                  }`}>
                  {message.text}
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2.5 bg-[#14B8A6] text-[#0A0A0F] rounded-xl font-medium hover:bg-[#0D9488] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="text-center text-sm text-[#52525B]">
            <p>TieLog v1.0.0</p>
          </section>
        </div>
      </div>
    </div>
  );
}
