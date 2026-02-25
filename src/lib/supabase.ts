import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage to avoid lock issues - use sessionStorage as fallback
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lockType: 'custom',
    storageKey: 'tielog-auth-v4',
  },
  global: {
    headers: {
      'x-client-info': 'tielog',
    },
  },
} as any);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
        };
      };
      clusters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          cluster_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cluster_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cluster_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          role?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          cluster_id: string | null;
          organization_id: string | null;
          person_id: string | null;
          content: string;
          audio_url: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cluster_id?: string | null;
          organization_id?: string | null;
          person_id?: string | null;
          content: string;
          audio_url?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cluster_id?: string | null;
          organization_id?: string | null;
          person_id?: string | null;
          content?: string;
          audio_url?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
    };
  };
};
