import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SyncIndicator from '@/components/sync/SyncIndicator';
import { useAppStore } from '@/store';

// Mock du store Zustand
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

describe('SyncIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne devrait pas s\'afficher si l\'utilisateur n\'est pas connecté', () => {
    // Arrange : utilisateur non connecté
    vi.mocked(useAppStore).mockReturnValue({
      user: null,
      syncStatus: {
        isSyncing: false,
        lastSyncAt: null,
        error: null,
      },
    } as any);

    // Act
    const { container } = render(<SyncIndicator />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher "Synchronisation..." quand isSyncing est true', () => {
    // Arrange : synchronisation en cours
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: true,
        lastSyncAt: null,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Synchronisation...')).toBeInTheDocument();
  });

  it('devrait afficher une icône animée (spinner) pendant la synchronisation', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: true,
        lastSyncAt: null,
        error: null,
      },
    } as any);

    // Act
    const { container } = render(<SyncIndicator />);

    // Assert : vérifier la présence de la classe animate-spin
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('devrait afficher "Erreur de sync" quand il y a une erreur', () => {
    // Arrange : erreur de synchronisation
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt: null,
        error: 'Erreur de connexion',
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Erreur de sync')).toBeInTheDocument();
    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
  });

  it('devrait afficher "À l\'instant" si la dernière sync a moins d\'une minute', () => {
    // Arrange : sync très récente (il y a 30 secondes)
    const lastSyncAt = new Date(Date.now() - 30 * 1000);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('À l\'instant')).toBeInTheDocument();
  });

  it('devrait afficher "Il y a X min" si la dernière sync a moins d\'une heure', () => {
    // Arrange : sync il y a 5 minutes
    const lastSyncAt = new Date(Date.now() - 5 * 60 * 1000);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Il y a 5 min')).toBeInTheDocument();
  });

  it('devrait afficher "Il y a Xh" si la dernière sync a moins de 24h', () => {
    // Arrange : sync il y a 3 heures
    const lastSyncAt = new Date(Date.now() - 3 * 60 * 60 * 1000);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Il y a 3h')).toBeInTheDocument();
  });

  it('devrait afficher "Il y a Xj" si la dernière sync a plus de 24h', () => {
    // Arrange : sync il y a 2 jours
    const lastSyncAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Il y a 2j')).toBeInTheDocument();
  });

  it('devrait afficher "Non synchronisé" si aucune sync n\'a jamais été faite', () => {
    // Arrange : jamais synchronisé
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt: null,
        error: null,
      },
    } as any);

    // Act
    render(<SyncIndicator />);

    // Assert
    expect(screen.getByText('Non synchronisé')).toBeInTheDocument();
  });

  it('devrait afficher une icône de succès (check) après une sync réussie', () => {
    // Arrange : sync réussie récemment
    const lastSyncAt = new Date(Date.now() - 1000);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt,
        error: null,
      },
    } as any);

    // Act
    const { container } = render(<SyncIndicator />);

    // Assert : vérifier la présence de l'icône check (couleur emerald)
    const icon = container.querySelector('.text-emerald-600, .text-emerald-400');
    expect(icon).toBeInTheDocument();
  });

  it('devrait afficher une icône d\'erreur (X) en cas d\'échec', () => {
    // Arrange : erreur de sync
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: {
        isSyncing: false,
        lastSyncAt: null,
        error: 'Network error',
      },
    } as any);

    // Act
    const { container } = render(<SyncIndicator />);

    // Assert : vérifier la présence de l'icône d'erreur (couleur red)
    const icon = container.querySelector('.text-red-600, .text-red-400');
    expect(icon).toBeInTheDocument();
  });
});
