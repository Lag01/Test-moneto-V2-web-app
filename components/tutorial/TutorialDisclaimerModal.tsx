'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TutorialDisclaimerModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export default function TutorialDisclaimerModal({
  isOpen,
  onContinue,
}: TutorialDisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 md:p-8 pointer-events-auto border-2 border-blue-400 dark:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icône d'information */}
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-3 md:mb-4">
                À propos des données du tutoriel
              </h2>

              {/* Message principal */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-5 mb-4 md:mb-6 border border-blue-200 dark:border-blue-800">
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Les données que vous allez voir pendant le tutoriel sont{' '}
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    uniquement des exemples
                  </span>
                  .
                </p>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  Ces données seront{' '}
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    automatiquement supprimées
                  </span>{' '}
                  à la fin du tutoriel. Vous pourrez ensuite créer vos propres plans avec vos
                  données réelles.
                </p>
              </div>

              {/* Bouton de confirmation */}
              <button
                onClick={onContinue}
                className="w-full px-4 md:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg min-h-[44px] text-sm md:text-base"
              >
                J&apos;ai compris, continuer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
