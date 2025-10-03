'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TutorialWelcomeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TutorialWelcomeModal({
  isOpen,
  onAccept,
  onDecline,
}: TutorialWelcomeModalProps) {
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
            onClick={onDecline}
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 md:p-8 pointer-events-auto border-2 border-emerald-400 dark:border-emerald-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icône de bienvenue avec animation */}
              <motion.div
                className="flex justify-center mb-4 md:mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Titre */}
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-3 md:mb-4">
                Bienvenue dans Moneto ! 🎉
              </h2>

              {/* Description */}
              <p className="text-sm md:text-lg text-slate-600 dark:text-slate-300 text-center mb-4 md:mb-6 leading-relaxed">
                C&apos;est votre première fois ici. Voulez-vous suivre un tutoriel rapide pour
                découvrir comment utiliser l&apos;application ?
              </p>

              {/* Liste des bénéfices */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs md:text-base font-semibold text-emerald-800 dark:text-emerald-300 mb-2 md:mb-3">
                  Le tutoriel vous montrera :
                </p>
                <ul className="space-y-1.5 md:space-y-2 text-xs md:text-base text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-1.5 md:gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
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
                    <span>Comment créer et gérer vos plans mensuels</span>
                  </li>
                  <li className="flex items-start gap-1.5 md:gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
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
                    <span>Comment définir vos revenus et dépenses fixes</span>
                  </li>
                  <li className="flex items-start gap-1.5 md:gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
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
                    <span>Comment répartir votre budget en enveloppes</span>
                  </li>
                  <li className="flex items-start gap-1.5 md:gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
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
                    <span>Comment visualiser vos flux financiers</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-center mb-4 md:mb-6">
                ⏱️ Le tutoriel prend environ 2-3 minutes
              </p>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onDecline}
                  className="flex-1 px-4 md:px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors min-h-[44px] text-sm md:text-base order-2 sm:order-1"
                >
                  Non merci
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 px-4 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg min-h-[44px] text-sm md:text-base order-1 sm:order-2"
                >
                  Oui, commencer !
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
