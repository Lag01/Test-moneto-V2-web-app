'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/repartition', label: 'Répartition' },
  { href: '/visualisation', label: 'Visualisation' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Header mobile avec bouton hamburger */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-slate-800 dark:bg-slate-950 text-white z-40 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-emerald-400 dark:text-emerald-300">Moneto</h1>
        </div>

        <button
          onClick={toggleMenu}
          className="p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Drawer latéral */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-slate-800 dark:bg-slate-950 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête du drawer */}
          <div className="p-6 border-b border-slate-700 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-emerald-400 dark:text-emerald-300">Moneto</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Gestion financière</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`block px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center ${
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
          </nav>

          {/* Footer avec ThemeToggle et retour accueil */}
          <div className="p-4 space-y-4 border-t border-slate-700 dark:border-slate-800">
            <div className="px-2">
              <ThemeToggle />
            </div>
            <Link
              href="/report-bug"
              onClick={closeMenu}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors min-h-[44px]"
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
            <Link
              href="/"
              onClick={closeMenu}
              className="block px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-white transition-colors min-h-[44px] flex items-center"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
