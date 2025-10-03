'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import TutorialSidebar from './tutorial/TutorialSidebar';
import { useTutorialContext } from '@/context/TutorialContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/repartition', label: 'Répartition' },
  { href: '/visualisation', label: 'Visualisation' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isActive: isTutorialActive } = useTutorialContext();

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
            {/* Theme Toggle */}
            <div className="px-2">
              <ThemeToggle />
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
