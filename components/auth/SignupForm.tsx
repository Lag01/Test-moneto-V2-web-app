'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useAppStore } from '@/store';
import Link from 'next/link';

export default function SignupForm() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);

  // Vérifier si Supabase est configuré au chargement
  useEffect(() => {
    setSupabaseAvailable(isSupabaseConfigured());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation du mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        setSuccess(true);

        // Rediriger vers le dashboard après 2 secondes
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  // Si Supabase n'est pas configuré, afficher un message
  if (!supabaseAvailable) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Synchronisation cloud non disponible
          </h2>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg mb-6">
            La synchronisation cloud n&apos;est pas configurée sur ce déploiement. Vous pouvez continuer à utiliser l&apos;application en mode local uniquement.
          </div>

          <Link
            href="/dashboard"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
          >
            Continuer en mode local
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un compte
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Sauvegardez et synchronisez vos données sur tous vos appareils
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg">
              Compte créé avec succès ! Redirection en cours...
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="votre@email.com"
              disabled={isLoading || success}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
              disabled={isLoading || success}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 6 caractères
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
              disabled={isLoading || success}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              🎉 Phase de test : tous les comptes sont automatiquement Premium avec synchronisation cloud !
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link
              href="/auth/login"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
