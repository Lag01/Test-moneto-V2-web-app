'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialContext } from '@/context/TutorialContext';
import { useTutorial } from '@/hooks/useTutorial';

export default function TutorialBanner() {
  const { isActive, currentStep, currentStepIndex, totalSteps, isBannerExpanded, setBannerExpanded } = useTutorialContext();
  const { nextStep, previousStep, quitTutorial, finishTutorial } = useTutorial();

  if (!isActive || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      finishTutorial();
    } else {
      nextStep();
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{
          y: isBannerExpanded ? 0 : '100%',
          opacity: isBannerExpanded ? 1 : 0
        }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t-4 border-emerald-400 dark:border-emerald-500 shadow-2xl md:hidden"
      >
        {/* Barre de progression en haut du bandeau */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* En-tête avec titre et bouton de fermeture */}
        <div className="px-4 py-2 flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Tutoriel - Étape {currentStepIndex + 1}/{totalSteps}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setBannerExpanded(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Minimiser le tutoriel"
            >
              <svg
                className="w-4 h-4 text-slate-600 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={quitTutorial}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Quitter le tutoriel"
            >
              <svg
                className="w-4 h-4 text-slate-600 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu expandable */}
        <AnimatePresence>
          {isBannerExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3">
                {/* Titre et description */}
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {currentStep.description}
                </p>

                {/* Boutons de navigation */}
                <div className="flex gap-2">
                  <button
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Précédent
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center justify-center gap-1"
                  >
                    {isLastStep ? (
                      <>
                        Terminer
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        Suivant
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bulle flottante pour rouvrir le tutoriel quand il est rétracté */}
      <AnimatePresence>
        {!isBannerExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => setBannerExpanded(true)}
            className="fixed bottom-8 left-4 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-2xl flex items-center justify-center md:hidden active:scale-95 transition-transform"
            aria-label="Ouvrir le tutoriel"
          >
            <svg
              className="w-7 h-7 text-white"
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
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
