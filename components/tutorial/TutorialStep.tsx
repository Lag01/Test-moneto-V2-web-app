'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TutorialStepData } from '@/lib/tutorial-data';
import TutorialProgressBar from './TutorialProgressBar';

interface TutorialStepProps {
  step: TutorialStepData;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isLastStep: boolean;
}

export default function TutorialStep({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isLastStep,
}: TutorialStepProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full mx-4 border-2 border-emerald-400 dark:border-emerald-500"
      >
        {/* Bouton "Passer le tutoriel" en haut à droite */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm font-medium"
          aria-label="Passer le tutoriel"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icône de tutoriel */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              className="w-8 h-8 text-white"
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
          </motion.div>
        </div>

        {/* Barre de progression */}
        <TutorialProgressBar currentStep={currentStepIndex} totalSteps={totalSteps} />

        {/* Contenu de l'étape */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {step.title}
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
            className="px-4 md:px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] text-sm md:text-base flex items-center gap-2"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Précédent
          </button>

          <button
            onClick={onSkip}
            className="px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm md:text-base font-medium"
          >
            Passer le tutoriel
          </button>

          <button
            onClick={onNext}
            className="px-4 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 min-h-[44px] text-sm md:text-base flex items-center gap-2 shadow-lg"
          >
            {isLastStep ? (
              <>
                Terminer
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            ) : (
              <>
                Suivant
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Aide clavier */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">←</kbd>{' '}
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">→</kbd> pour
            naviguer •{' '}
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Entrée</kbd>{' '}
            pour continuer •{' '}
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Échap</kbd>{' '}
            pour quitter
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
