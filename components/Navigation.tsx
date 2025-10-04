'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import TutorialSidebar from './tutorial/TutorialSidebar';
import SyncIndicator from './sync/SyncIndicator';
import { useTutorialContext } from '@/context/TutorialContext';
import { useAppStore } from '@/store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/repartition', label: 'Répartition' },
  { href: '/visualisation', label: 'Visualisation' },
  { href: '/profile', label: 'Profil' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isActive: isTutorialActive } = useTutorialContext();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  return (
    <nav className="hidden md:flex bg-slate-800 dark:bg-slate-950 text-white w-64 min-h-screen p-6 flex-col fixed left-0 top-0 bottom-0 z-30 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-400 dark:text-emerald-300">Moneto</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Gestion financière</p>
      </div>

      {/* Panneau de tutoriel en overlay full-size (masque tout quand actif) */}
      <TutorialSidebar />

      {/* Navigation normale - cachée pendant le tutoriel */}
      {!isTutorialActive && (
        <>
          <ul className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-600 dark:bg-emerald-700 text-white font-medium'
                        : 'text-slate-300 dark:text-slate-400 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="space-y-4">
            {/* Indicateur de synchronisation */}
            <div className="px-2">
              <SyncIndicator />
            </div>

            {/* Theme Toggle */}
            <div className="px-2">
              <ThemeToggle />
            </div>

            {/* Section authentification */}
            <div className="pt-4 border-t border-slate-700 dark:border-slate-800">
              {user ? (
                <div className="space-y-2">
                  {/* Info utilisateur */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.email}
                        </p>
                        {user.isPremium && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-600 dark:bg-emerald-700 text-white rounded">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Bouton déconnexion */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Se connecter
                </Link>
              )}
            </div>

            {/* Signaler un bug */}
            <div className="pt-4 border-t border-slate-700 dark:border-slate-800">
              <Link
                href="/report-bug"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Signaler un bug
              </Link>
            </div>

            {/* Retour accueil */}
            <div>
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
