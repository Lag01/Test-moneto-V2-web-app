import { vi } from 'vitest';
import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';

/**
 * Mock d'un utilisateur Supabase
 */
export const createMockUser = (overrides?: Partial<SupabaseUser>): SupabaseUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides,
} as SupabaseUser);

/**
 * Mock d'une session Supabase
 */
export const createMockSession = (user?: SupabaseUser): Session => ({
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  refresh_token: 'mock-refresh-token',
  user: user || createMockUser(),
});

/**
 * Mock d'une erreur d'authentification
 */
export const createMockAuthError = (message: string): AuthError => ({
  name: 'AuthError',
  message,
  status: 400,
});

/**
 * Mock du client Supabase avec des méthodes mockées
 */
export const createMockSupabaseClient = () => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })),
  };

  const mockFrom = vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  }));

  return {
    auth: mockAuth,
    from: mockFrom,
  };
};

/**
 * Mock des résultats de requêtes Supabase
 */
export const createMockQueryResult = <T>(data: T, error: Error | null = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});
