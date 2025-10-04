import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';
import { useAppStore } from '@/store';
import * as authModule from '@/lib/supabase/auth';

// Mock du router Next.js
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock du store Zustand
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

// Mock du module auth
vi.mock('@/lib/supabase/auth');

describe('LoginForm', () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockSetUser.mockClear();

    vi.mocked(useAppStore).mockReturnValue({
      setUser: mockSetUser,
    } as any);
  });

  it('devrait afficher le titre "Connexion"', () => {
    // Act
    render(<LoginForm />);

    // Assert
    expect(screen.getByText('Connexion')).toBeInTheDocument();
  });

  it('devrait afficher les champs email et password', () => {
    // Act
    render(<LoginForm />);

    // Assert
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('devrait afficher un lien vers la page d\'inscription', () => {
    // Act
    render(<LoginForm />);

    // Assert
    const link = screen.getByText('S\'inscrire');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/auth/signup');
  });

  it('devrait permettre de saisir l\'email et le mot de passe', () => {
    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Mot de passe') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Assert
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('devrait afficher "Connexion..." pendant la soumission', async () => {
    // Arrange
    vi.mocked(authModule.signIn).mockImplementation(() => new Promise(() => {})); // Promesse qui ne se résout jamais

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Connexion...')).toBeInTheDocument();
    });
  });

  it('devrait appeler signIn avec les bonnes valeurs au submit', async () => {
    // Arrange
    const mockSignIn = vi.mocked(authModule.signIn).mockResolvedValue({
      success: true,
      user: {
        id: '123',
        email: 'test@example.com',
        isPremium: true,
        isAuthenticated: true,
      },
    });

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('devrait appeler setUser et rediriger après connexion réussie', async () => {
    // Arrange
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isPremium: true,
      isAuthenticated: true,
    };

    vi.mocked(authModule.signIn).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
    // Arrange
    vi.mocked(authModule.signIn).mockResolvedValue({
      success: false,
      error: 'Email ou mot de passe incorrect',
    });

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs inattendues', async () => {
    // Arrange
    vi.mocked(authModule.signIn).mockRejectedValue(new Error('Network error'));

    // Spy console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Une erreur inattendue s\'est produite')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('devrait désactiver les champs pendant la soumission', async () => {
    // Arrange
    vi.mocked(authModule.signIn).mockImplementation(() => new Promise(() => {})); // Ne se résout jamais

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /se connecter/i }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('ne devrait pas appeler setUser si la connexion échoue', async () => {
    // Arrange
    vi.mocked(authModule.signIn).mockResolvedValue({
      success: false,
      error: 'Erreur de connexion',
    });

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
    });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('devrait réinitialiser le message d\'erreur lors d\'une nouvelle soumission', async () => {
    // Arrange
    let callCount = 0;
    vi.mocked(authModule.signIn).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { success: false, error: 'Première erreur' };
      }
      return { success: false, error: 'Deuxième erreur' };
    });

    // Act
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form')!;

    // Premier submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Première erreur')).toBeInTheDocument();
    });

    // Deuxième submit
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText('Première erreur')).not.toBeInTheDocument();
      expect(screen.getByText('Deuxième erreur')).toBeInTheDocument();
    });
  });
});
