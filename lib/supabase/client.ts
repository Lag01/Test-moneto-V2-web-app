import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
}

// Créer le client Supabase avec le typage TypeScript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
});
