import { supabase } from './client';
import type { AuthError, User as SupabaseUser, Session } from '@supabase/supabase-js';

/**
 * Type pour l'utilisateur de l'application
 */
export interface User {
  id: string;
  email: string;
  isPremium: boolean; // Pour l'instant, tous les utilisateurs connectés sont premium
  isAuthenticated: boolean;
}

/**
 * Type pour le résultat d'une opération d'authentification
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Convertit un utilisateur Supabase en utilisateur de l'application
 */
function toAppUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    isPremium: true, // Phase de test : tous les comptes sont premium
    isAuthenticated: true,
  };
}

/**
 * Traduit les erreurs d'authentification Supabase en français
 */
function translateAuthError(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Email non confirmé',
    'User already registered': 'Cet email est déjà utilisé',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Unable to validate email address: invalid format': 'Format d\'email invalide',
    'Signup requires a valid password': 'Un mot de passe valide est requis',
    'User not found': 'Utilisateur introuvable',
  };

  return errorMessages[error.message] || `Erreur d'authentification : ${error.message}`;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
      };
    }

    return {
      success: true,
      user: toAppUser(data.user),
    };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
    };
  }
}

/**
 * Connexion d'un utilisateur existant
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erreur lors de la connexion',
      };
    }

    return {
      success: true,
      user: toAppUser(data.user),
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
    };
  }
}

/**
 * Déconnexion de l'utilisateur actuel
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: translateAuthError(error),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
    };
  }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return toAppUser(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Récupère la session actuelle
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
}

/**
 * Écoute les changements d'état d'authentification
 * Callback appelé à chaque changement de session (login, logout, refresh token)
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        callback(toAppUser(session.user));
      } else {
        callback(null);
      }
    }
  );

  // Retourne une fonction de nettoyage pour désinscrire l'écouteur
  return () => {
    subscription.unsubscribe();
  };
}
