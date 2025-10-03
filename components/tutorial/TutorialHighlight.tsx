'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TutorialHighlightProps {
  selector?: string;
  children?: React.ReactNode;
}

/**
 * Composant pour mettre en surbrillance un élément pendant le tutoriel
 * Si un sélecteur est fourni, calcule la position de l'élément et crée un spotlight
 * Sinon, affiche simplement les enfants
 */
export default function TutorialHighlight({ selector, children }: TutorialHighlightProps) {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selector) return;

    const updatePosition = () => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
      }
    };

    // Mettre à jour la position initialement
    updatePosition();

    // Mettre à jour lors du scroll ou du resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    // Observer les changements dans le DOM
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [selector]);

  if (!selector || !elementRect) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Spotlight sur l'élément */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          top: elementRect.top - 8,
          left: elementRect.left - 8,
          width: elementRect.width + 16,
          height: elementRect.height + 16,
        }}
      >
        {/* Bordure brillante animée */}
        <motion.div
          className="absolute inset-0 rounded-lg border-4 border-emerald-400 dark:border-emerald-500 shadow-lg shadow-emerald-400/50"
          animate={{
            boxShadow: [
              '0 0 20px rgba(52, 211, 153, 0.5)',
              '0 0 40px rgba(52, 211, 153, 0.8)',
              '0 0 20px rgba(52, 211, 153, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Fond semi-transparent pour mettre en valeur */}
        <div className="absolute inset-0 bg-white/5 dark:bg-white/10 rounded-lg backdrop-blur-[1px]" />
      </motion.div>

      {children}
    </>
  );
}
