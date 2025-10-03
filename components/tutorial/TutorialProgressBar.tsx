'use client';

import { motion } from 'framer-motion';

interface TutorialProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function TutorialProgressBar({
  currentStep,
  totalSteps,
}: TutorialProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Indicateur textuel */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
          Étape {currentStep + 1} sur {totalSteps}
        </span>
        <span className="text-xs md:text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Points d'étape */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index <= currentStep
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: index === currentStep ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
