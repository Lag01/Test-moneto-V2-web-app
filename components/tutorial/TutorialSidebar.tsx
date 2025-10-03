'use client';

import { motion } from 'framer-motion';
import { useTutorialContext } from '@/context/TutorialContext';
import { useTutorial } from '@/hooks/useTutorial';
import TutorialProgressBar from './TutorialProgressBar';

export default function TutorialSidebar() {
  const { isActive, currentStep, currentStepIndex, totalSteps } = useTutorialContext();
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 bg-slate-800 dark:bg-slate-950 flex flex-col p-6"
    >
      {/* En-tête avec icône */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <div>
            <p className="text-lg font-bold text-emerald-400 dark:text-emerald-300">Tutoriel</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Guide interactif</p>
          </div>
        </div>

        <button
          onClick={quitTutorial}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Quitter le tutoriel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Barre de progression */}
      <div className="mb-8">
        <TutorialProgressBar currentStep={currentStepIndex} totalSteps={totalSteps} />
      </div>

      {/* Contenu principal avec flex-1 pour prendre l'espace */}
      <div className="flex-1 flex flex-col">
        {/* Titre et description */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {currentStep.title}
          </h3>
          <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Spacer pour pousser les boutons vers le bas */}
        <div className="flex-1" />

        {/* Boutons de navigation */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleNext}
            className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {isLastStep ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Terminer le tutoriel
              </>
            ) : (
              <>
                Étape suivante
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>

          <button
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className="w-full px-6 py-3 bg-slate-700 dark:bg-slate-800 text-slate-200 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Étape précédente
          </button>
        </div>

        {/* Aide clavier */}
        <div className="pt-4 border-t border-slate-700 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            <kbd className="px-2 py-1 bg-slate-700 dark:bg-slate-800 rounded text-xs">←</kbd>{' '}
            <kbd className="px-2 py-1 bg-slate-700 dark:bg-slate-800 rounded text-xs">→</kbd>{' '}
            pour naviguer •{' '}
            <kbd className="px-2 py-1 bg-slate-700 dark:bg-slate-800 rounded text-xs">Entrée</kbd>{' '}
            continuer •{' '}
            <kbd className="px-2 py-1 bg-slate-700 dark:bg-slate-800 rounded text-xs">Échap</kbd>{' '}
            quitter
          </p>
        </div>
      </div>
    </motion.div>
  );
}
