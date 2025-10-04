import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render pour les tests avec providers si nécessaire
 */
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Re-export tout de @testing-library/react
export * from '@testing-library/react';
export { customRender as render };

/**
 * Utilitaire pour attendre un délai (utile pour les tests asynchrones)
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utilitaire pour créer un timestamp dans le futur/passé
 */
export const createTimestamp = (offsetMs: number = 0): string => {
  return new Date(Date.now() + offsetMs).toISOString();
};
