import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Vérifie si Supabase est configuré avec les variables d'environnement nécessaires
 * @returns true si Supabase est configuré, false sinon
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Client Supabase avec le typage TypeScript
 * Peut être null si les variables d'environnement ne sont pas configurées
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // Stockage de la session dans localStorage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Auto-refresh du token avant expiration
        autoRefreshToken: true,
        // Persister la session
        persistSession: true,
        // Détecter les changements de session (dans d'autres onglets)
        detectSessionInUrl: true,
      },
    })
  : null;
