'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { db } from '@/lib/db';
import { fetchFromSupabase, syncToSupabase, setupOnlineListener } from '@/lib/sync';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { setUser: setStoreUser, setUserId } = useAppStore();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          const path = window.location.pathname;
          if (path !== '/auth/signin' && path !== '/auth/signup') {
            router.push('/auth/signin');
          }
          setIsLoading(false);
          return;
        }

        setUser(session.user);

        if (session.user) {
          setUserId(session.user.id);

          let profile = await db.profiles.get(session.user.id);

          if (!profile) {
            profile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              plan: 'free',
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              subscriptionStatus: null,
              created_at: new Date().toISOString(),
              synced: false,
            };
            await db.profiles.put(profile);
          }

          // Fetch latest profile with plan from Prisma
          try {
            const res = await fetch(`/api/profile?userId=${session.user.id}`);
            if (res.ok) {
              const prismaProfile = await res.json();
              profile = {
                ...profile,
                plan: prismaProfile.plan || 'free',
                stripeCustomerId: prismaProfile.stripeCustomerId,
                stripeSubscriptionId: prismaProfile.stripeSubscriptionId,
                subscriptionStatus: prismaProfile.subscriptionStatus,
              };
              await db.profiles.put(profile);
            }
          } catch (err) {
            console.error('Failed to fetch profile plan:', err);
          }

          setStoreUser(profile);
        }

        const path = window.location.pathname;
        if (path === '/auth/signin' || path === '/auth/signup') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Sync pending changes when coming back online
    const cleanupOnlineListener = setupOnlineListener(
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Back online - syncing to Supabase');
          syncToSupabase(session.user.id).catch(err => console.error('Sync error:', err));
        }
      },
      () => console.log('Went offline')
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStoreUser(null);
        setUserId(null);
        router.push('/auth/signin');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        if (session.user) {
          setUserId(session.user.id);
          // Fetch data in background without blocking redirect
          fetchFromSupabase(session.user.id).catch(err => console.error('Fetch error:', err));
        }
        const path = window.location.pathname;
        if (path === '/auth/signin' || path === '/auth/signup') {
          router.push('/dashboard');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      cleanupOnlineListener?.();
    };
  }, [router, setStoreUser, setUserId]);

  return { user, isLoading };
}
