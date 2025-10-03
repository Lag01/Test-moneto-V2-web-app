'use client';

import Link from 'next/link';

export default function PresentationPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 md:px-24 pt-8 md:pt-24 pb-4 md:pb-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl w-full">
        {/* En-tête principale */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src="/icons/icon-192x192.png"
              alt="Moneto"
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Moneto
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-400 font-medium">
            Application de gestion financière personnelle
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-500 mt-2">
            Maîtrisez votre budget avec la méthode des enveloppes
          </p>
        </div>

        {/* Image illustrative / Placeholder */}
        <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-emerald-100 dark:bg-slate-800 p-8 md:py-6 md:px-10 flex items-center justify-center aspect-video md:aspect-[3/1]">
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-3xl">
              {/* Simulation visuelle de l'app */}
              <div className="bg-white dark:bg-slate-600 rounded-lg p-3 md:p-8 shadow-lg">
                <div className="h-3 md:h-8 bg-emerald-500 rounded mb-2 md:mb-4"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded mb-1 md:mb-3"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded w-2/3"></div>
              </div>
              <div className="bg-white dark:bg-slate-600 rounded-lg p-3 md:p-8 shadow-lg">
                <div className="h-3 md:h-8 bg-blue-500 rounded mb-2 md:mb-4"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded mb-1 md:mb-3"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded w-3/4"></div>
              </div>
              <div className="bg-white dark:bg-slate-600 rounded-lg p-3 md:p-8 shadow-lg">
                <div className="h-3 md:h-8 bg-purple-500 rounded mb-2 md:mb-4"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded mb-1 md:mb-3"></div>
                <div className="h-2 md:h-6 bg-slate-200 dark:bg-slate-500 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités principales */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-10">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Revenus et dépenses fixes
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Saisissez facilement vos revenus mensuels et vos dépenses fixes récurrentes
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Répartition en enveloppes
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Distribuez le reste de votre budget dans différentes enveloppes thématiques
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Diagramme Sankey
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Visualisez vos flux financiers avec un diagramme interactif et intuitif
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Sauvegarde locale
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Vos données restent sur votre appareil, aucun serveur externe requis
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-pink-600 dark:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Mode PWA
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Installez l&apos;application sur votre mobile ou ordinateur comme une app native
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Statistiques mensuelles
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Suivez l&apos;évolution de vos finances avec des résumés clairs et détaillés
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mb-12">
          <Link
            href="/home"
            className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <span>Tester l&apos;application</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">
            Gratuit • Sans inscription • Données privées
          </p>
        </div>

        {/* Créateur */}
        <div className="text-center pt-6 pb-0 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Application créée par
          </p>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Erwan GUEZINGAR
          </p>
        </div>
      </div>
    </main>
  );
}
