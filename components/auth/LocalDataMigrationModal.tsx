'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';

interface LocalDataMigrationModalProps {
  isOpen: boolean;
  localPlansCount: number;
  onClose: () => void;
}

export default function LocalDataMigrationModal({
  isOpen,
  localPlansCount,
  onClose,
}: LocalDataMigrationModalProps) {
  const importLocalDataToCloud = useAppStore((state) => state.importLocalDataToCloud);
  const setDataMigrationStatus = useAppStore((state) => state.setDataMigrationStatus);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migratedCount, setMigratedCount] = useState(0);

  const handleMigrateNow = async () => {
    setIsMigrating(true);
    setError(null);

    try {
      const result = await importLocalDataToCloud();

      if (result.success) {
        setMigratedCount(result.migratedCount || 0);
        setMigrationComplete(true);

        // Fermer automatiquement après 3 secondes
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(result.error || 'Erreur lors de la migration');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDecline = () => {
    // Marquer que l'utilisateur a refusé (pour l'instant)
    setDataMigrationStatus({
      wasDeclined: true,
      lastProposedAt: new Date(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Synchroniser vos données
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Sauvegardez vos plans mensuels dans le cloud
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!migrationComplete && !error && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      {localPlansCount} {localPlansCount > 1 ? 'plans détectés' : 'plan détecté'} sur cet appareil
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Nous avons détecté des plans mensuels stockés localement sur cet appareil.
                      Souhaitez-vous les synchroniser avec votre compte cloud ?
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Avantages de la synchronisation :
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Sauvegarde automatique dans le cloud</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Accès depuis tous vos appareils</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Synchronisation automatique en temps réel</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Vos données locales restent conservées</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {isMigrating && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  Migration en cours...
                </p>
              </div>
            </div>
          )}

          {migrationComplete && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                    Migration réussie !
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    {migratedCount} {migratedCount > 1 ? 'plans ont été synchronisés' : 'plan a été synchronisé'} avec succès.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                    Erreur lors de la migration
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          {!migrationComplete && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleMigrateNow}
                disabled={isMigrating}
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isMigrating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Synchroniser maintenant
                  </>
                )}
              </button>
              <button
                onClick={handleDecline}
                disabled={isMigrating}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Plus tard
              </button>
            </div>
          )}

          {migrationComplete && (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
