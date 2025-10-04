'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useAppStore } from '@/store';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);

  // Vérifier si Supabase est configuré au chargement
  useEffect(() => {
    setSupabaseAvailable(isSupabaseConfigured());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Erreur lors de la connexion');
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Connexion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
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
              disabled={isLoading}
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/signup"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
