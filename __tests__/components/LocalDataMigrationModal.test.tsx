import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocalDataMigrationModal from '@/components/auth/LocalDataMigrationModal';
import { useAppStore } from '@/store';

// Mock du store Zustand
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

describe('LocalDataMigrationModal', () => {
  const mockImportLocalDataToCloud = vi.fn();
  const mockSetDataMigrationStatus = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      importLocalDataToCloud: mockImportLocalDataToCloud,
      setDataMigrationStatus: mockSetDataMigrationStatus,
    } as any);
  });

  it('ne devrait pas s\'afficher si isOpen est false', () => {
    // Act
    const { container } = render(
      <LocalDataMigrationModal
        isOpen={false}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher le titre et le nombre de plans détectés', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={3}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByText('Synchroniser vos données')).toBeInTheDocument();
    expect(screen.getByText('3 plans détectés sur cet appareil')).toBeInTheDocument();
  });

  it('devrait afficher "1 plan détecté" au singulier', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={1}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByText('1 plan détecté sur cet appareil')).toBeInTheDocument();
  });

  it('devrait afficher les avantages de la synchronisation', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByText('Avantages de la synchronisation :')).toBeInTheDocument();
    expect(screen.getByText('Sauvegarde automatique dans le cloud')).toBeInTheDocument();
    expect(screen.getByText('Accès depuis tous vos appareils')).toBeInTheDocument();
    expect(screen.getByText('Synchronisation automatique en temps réel')).toBeInTheDocument();
    expect(screen.getByText('Vos données locales restent conservées')).toBeInTheDocument();
  });

  it('devrait avoir un bouton "Synchroniser maintenant"', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByText('Synchroniser maintenant')).toBeInTheDocument();
  });

  it('devrait avoir un bouton "Plus tard"', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByText('Plus tard')).toBeInTheDocument();
  });

  it('devrait appeler importLocalDataToCloud au clic sur "Synchroniser maintenant"', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockResolvedValue({
      success: true,
      migratedCount: 5,
    });

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(mockImportLocalDataToCloud).toHaveBeenCalledTimes(1);
    });
  });

  it('devrait afficher "Migration en cours..." pendant la migration', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockImplementation(() => new Promise(() => {})); // Ne se résout jamais

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Migration en cours...')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message de succès après migration réussie', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockResolvedValue({
      success: true,
      migratedCount: 5,
    });

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Migration réussie !')).toBeInTheDocument();
      expect(screen.getByText('5 plans ont été synchronisés avec succès.')).toBeInTheDocument();
    });
  });

  it('devrait afficher "1 plan a été synchronisé" au singulier', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockResolvedValue({
      success: true,
      migratedCount: 1,
    });

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={1}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('1 plan a été synchronisé avec succès.')).toBeInTheDocument();
    });
  });

  it('devrait fermer automatiquement après 3s si migration réussie', async () => {
    // Arrange
    vi.useFakeTimers();
    mockImportLocalDataToCloud.mockResolvedValue({
      success: true,
      migratedCount: 5,
    });

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByText('Migration réussie !')).toBeInTheDocument();
    });

    // Fast-forward 3 secondes
    vi.advanceTimersByTime(3000);

    // Assert
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });

  it('devrait afficher un message d\'erreur si la migration échoue', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockResolvedValue({
      success: false,
      error: 'Erreur de connexion au serveur',
    });

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la migration')).toBeInTheDocument();
      expect(screen.getByText('Erreur de connexion au serveur')).toBeInTheDocument();
    });
  });

  it('devrait appeler onClose au clic sur "Plus tard"', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const laterButton = screen.getByText('Plus tard');
    fireEvent.click(laterButton);

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait marquer la migration comme refusée au clic sur "Plus tard"', () => {
    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const laterButton = screen.getByText('Plus tard');
    fireEvent.click(laterButton);

    // Assert
    expect(mockSetDataMigrationStatus).toHaveBeenCalledWith({
      wasDeclined: true,
      lastProposedAt: expect.any(Date),
    });
  });

  it('devrait désactiver les boutons pendant la migration', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockImplementation(() => new Promise(() => {}));

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    const laterButton = screen.getByText('Plus tard');

    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(syncButton.closest('button')).toBeDisabled();
      expect(laterButton.closest('button')).toBeDisabled();
    });
  });

  it('devrait gérer les erreurs inattendues', async () => {
    // Arrange
    mockImportLocalDataToCloud.mockRejectedValue(new Error('Unexpected error'));

    // Spy console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(
      <LocalDataMigrationModal
        isOpen={true}
        localPlansCount={5}
        onClose={mockOnClose}
      />
    );

    const syncButton = screen.getByText('Synchroniser maintenant');
    fireEvent.click(syncButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Une erreur inattendue s\'est produite')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
