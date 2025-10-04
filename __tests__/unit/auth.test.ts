import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';
import { createMockUser, createMockAuthError } from '../helpers/supabase-mock';

// Mock du client Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('Authentification Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('devrait créer un compte avec succès', async () => {
      const mockUser = createMockUser({ email: 'newuser@example.com' });
      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any);

      const result = await signUp('newuser@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('newuser@example.com');
      expect(result.user?.isPremium).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      });
    });

    it('devrait retourner une erreur si l\'email est déjà utilisé', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const mockError = createMockAuthError('User already registered');

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signUp('existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cet email est déjà utilisé');
    });

    it('devrait retourner une erreur si le mot de passe est trop court', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const mockError = createMockAuthError('Password should be at least 6 characters');

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signUp('user@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Le mot de passe doit contenir au moins 6 caractères');
    });
  });

  describe('signIn', () => {
    it('devrait se connecter avec succès', async () => {
      const mockUser = createMockUser();
      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any);

      const result = await signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('test-user-id');
      expect(result.user?.email).toBe('test@example.com');
    });

    it('devrait retourner une erreur si les identifiants sont incorrects', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const mockError = createMockAuthError('Invalid login credentials');

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signIn('wrong@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email ou mot de passe incorrect');
    });
  });

  describe('signOut', () => {
    it('devrait se déconnecter avec succès', async () => {
      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const mockError = createMockAuthError('Logout failed');

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erreur d\'authentification');
    });
  });

  describe('getCurrentUser', () => {
    it('devrait récupérer l\'utilisateur connecté', async () => {
      const mockUser = createMockUser();
      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.id).toBe('test-user-id');
      expect(user?.isPremium).toBe(true);
    });

    it('devrait retourner null si aucun utilisateur n\'est connecté', async () => {
      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('devrait écouter les changements d\'authentification', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const callback = vi.fn();

      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      } as any);

      const unsubscribe = onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Tester la désinscription
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
