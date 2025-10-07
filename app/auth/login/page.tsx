import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Moneto
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion financière par enveloppes
          </p>
        </div>

        {/* Formulaire de connexion */}
        <LoginForm />

        {/* Lien retour */}
        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            ← Continuer sans compte (mode local uniquement)
          </Link>
        </div>
      </div>
    </div>
  );
}
