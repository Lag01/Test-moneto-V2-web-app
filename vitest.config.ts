import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: [
      '__tests__/unit/**/*.test.{ts,tsx}',
      '__tests__/components/**/*.test.{ts,tsx}', // Inclure tests composants
    ],
    exclude: [
      '__tests__/manual/**/*',
      '__tests__/e2e/**/*', // Exclure tests E2E (Playwright)
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'], // Ajouter lcov pour CI/CD
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'store/**/*.{ts,tsx}',
        'components/**/*.{tsx}',
      ],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.config.ts',
        '**/types.ts',
        'app/**', // Exclure les pages Next.js (difficiles à tester unitairement)
        'lib/diagnostics/**', // Déjà testés indirectement
      ],
      // Seuils de couverture (décommenter pour CI/CD strict)
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 60,
      //   statements: 70,
      // },
      all: true, // Inclure tous les fichiers (même non importés)
      clean: true, // Nettoyer avant chaque run
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
