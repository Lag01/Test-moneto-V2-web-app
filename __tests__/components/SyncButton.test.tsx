import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SyncButton from '@/components/sync/SyncButton';
import { useAppStore } from '@/store';

// Mock du store Zustand
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

describe('SyncButton', () => {
  const mockSyncWithCloud = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncWithCloud.mockClear();
  });

  it('ne devrait pas s\'afficher si l\'utilisateur n\'est pas connecté', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: null,
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher "Synchroniser" par défaut', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton />);

    // Assert
    expect(screen.getByText('Synchroniser')).toBeInTheDocument();
  });

  it('devrait être disabled pendant la synchronisation', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: true, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton />);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Synchronisation...')).toBeInTheDocument();
  });

  it('devrait appeler syncWithCloud au clic', async () => {
    // Arrange
    mockSyncWithCloud.mockResolvedValue(undefined);

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(mockSyncWithCloud).toHaveBeenCalledTimes(1);
    });
  });

  it('ne devrait pas appeler syncWithCloud si déjà en cours de sync', async () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: true, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button); // Bouton disabled, ne devrait pas trigger

    // Assert
    expect(mockSyncWithCloud).not.toHaveBeenCalled();
  });

  it('devrait afficher "Synchronisé" temporairement après succès', async () => {
    // Arrange
    mockSyncWithCloud.mockResolvedValue(undefined);

    let syncStatus = { isSyncing: false, lastSyncAt: null, error: null };

    vi.mocked(useAppStore).mockImplementation((selector: any) => {
      const state = {
        user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
        syncStatus,
        syncWithCloud: mockSyncWithCloud,
      };
      return selector(state);
    });

    // Act
    render(<SyncButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Synchronisé')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait accepter la variant "primary" (par défaut)', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton variant="primary" />);

    // Assert : vérifier la classe bg-emerald-600
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-emerald-600');
  });

  it('devrait accepter la variant "secondary"', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton variant="secondary" />);

    // Assert : vérifier la classe bg-slate-600
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-slate-600');
  });

  it('devrait accepter la variant "ghost"', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton variant="ghost" />);

    // Assert : vérifier la classe bg-transparent
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-transparent');
  });

  it('devrait accepter size="sm"', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton size="sm" />);

    // Assert : vérifier la classe text-xs
    const button = container.querySelector('button');
    expect(button?.className).toContain('text-xs');
  });

  it('devrait accepter size="md" (par défaut)', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton size="md" />);

    // Assert : vérifier la classe text-sm
    const button = container.querySelector('button');
    expect(button?.className).toContain('text-sm');
  });

  it('devrait accepter size="lg"', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    const { container } = render(<SyncButton size="lg" />);

    // Assert : vérifier la classe text-base
    const button = container.querySelector('button');
    expect(button?.className).toContain('text-base');
  });

  it('devrait masquer le label si showLabel=false', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton showLabel={false} />);

    // Assert : le texte ne devrait pas être visible
    expect(screen.queryByText('Synchroniser')).not.toBeInTheDocument();
  });

  it('devrait afficher le label par défaut (showLabel=true)', () => {
    // Arrange
    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Act
    render(<SyncButton />);

    // Assert
    expect(screen.getByText('Synchroniser')).toBeInTheDocument();
  });

  it('devrait gérer les erreurs de synchronisation sans crash', async () => {
    // Arrange
    mockSyncWithCloud.mockRejectedValue(new Error('Network error'));

    vi.mocked(useAppStore).mockReturnValue({
      user: { id: '123', email: 'test@test.com', isPremium: true, isAuthenticated: true },
      syncStatus: { isSyncing: false, lastSyncAt: null, error: null },
      syncWithCloud: mockSyncWithCloud,
    } as any);

    // Spy console.error pour vérifier qu'il est appelé
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(<SyncButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
