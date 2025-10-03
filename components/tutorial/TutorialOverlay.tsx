'use client';

import { AnimatePresence } from 'framer-motion';
import { useTutorialContext } from '@/context/TutorialContext';
import TutorialHighlight from './TutorialHighlight';
import TutorialBanner from './TutorialBanner';

/**
 * TutorialOverlay - Gère l'affichage du tutoriel de façon non-bloquante
 * - Desktop : le panneau s'affiche dans la navigation (géré par Navigation.tsx)
 * - Mobile : affiche TutorialBanner en bas de l'écran
 * - Highlight : met en surbrillance les éléments importants (si spécifié)
 */
export default function TutorialOverlay() {
  const { isActive, currentStep } = useTutorialContext();

  if (!isActive || !currentStep) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Zone de surbrillance non-bloquante si nécessaire */}
          {currentStep.highlightSelector && (
            <TutorialHighlight selector={currentStep.highlightSelector} />
          )}

          {/* Bandeau de tutoriel mobile uniquement */}
          <TutorialBanner />
        </>
      )}
    </AnimatePresence>
  );
}
