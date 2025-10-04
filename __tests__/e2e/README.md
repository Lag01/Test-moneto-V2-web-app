# 🎭 Tests End-to-End (E2E) - Moneto V2

Ce dossier contient les tests end-to-end pour valider le comportement complet de l'application en conditions réelles.

---

## 🎯 Objectif

Les tests E2E simulent un utilisateur réel qui :
- Navigue dans l'application
- Remplit des formulaires
- Interagit avec les composants
- Vérifie les données synchronisées avec Supabase

---

## 🛠️ Setup avec Playwright (recommandé)

### Installation

```bash
# Installer Playwright
npm install --save-dev @playwright/test

# Installer les navigateurs
npx playwright install
```

### Configuration

Créer `playwright.config.ts` à la racine :

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Scripts npm

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 🔧 Setup avec Cypress (alternative)

### Installation

```bash
npm install --save-dev cypress
```

### Configuration

```bash
# Ouvrir Cypress pour la première fois
npx cypress open
```

Créer `cypress.config.ts` :

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### Scripts npm

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

---

## 🧪 Environnement de test Supabase

### Créer un projet Supabase de test

1. Aller sur [https://app.supabase.com](https://app.supabase.com)
2. Créer un nouveau projet : `moneto-v2-test`
3. Appliquer la migration SQL : `supabase/migrations/20250104000000_initial_schema.sql`

### Configuration des variables d'environnement

Créer `.env.test.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx-test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

### Créer des utilisateurs de test

Dans le SQL Editor Supabase :

```sql
-- Créer un utilisateur de test
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@moneto.local',
  crypt('testpassword123', gen_salt('bf')),
  NOW()
);
```

---

## 📝 Scénarios de test critiques

### 1. Authentification complète

```typescript
test('flow auth complet', async ({ page }) => {
  // 1. Aller sur la page de signup
  await page.goto('/auth/signup');

  // 2. Remplir le formulaire
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.fill('[name="confirmPassword"]', 'password123');

  // 3. Soumettre
  await page.click('button[type="submit"]');

  // 4. Vérifier la redirection
  await page.waitForURL('/dashboard');

  // 5. Vérifier que l'utilisateur est connecté
  await expect(page.locator('text=test@example.com')).toBeVisible();
});
```

### 2. Création et synchronisation de plan

```typescript
test('création et sync d\'un plan', async ({ page }) => {
  // 1. Se connecter
  await login(page, 'test@moneto.local', 'testpassword123');

  // 2. Créer un nouveau plan
  await page.goto('/dashboard');
  await page.click('text=Créer un nouveau plan');

  // 3. Attendre la redirection
  await page.waitForURL('/onboarding');

  // 4. Ajouter des revenus
  await page.fill('[placeholder="Nom du revenu"]', 'Salaire');
  await page.fill('[placeholder="Montant"]', '2500');
  await page.click('text=Ajouter un revenu');

  // 5. Passer à l'étape suivante
  await page.click('text=Étape suivante');

  // 6. Vérifier la synchronisation
  await page.waitForTimeout(3000); // Attendre le debounce

  // 7. Vérifier dans la console Supabase que le plan existe
  // (nécessite un appel API ou vérification DB)
});
```

### 3. Test de conflits de synchronisation

```typescript
test('résolution de conflits last-write-wins', async ({ browser }) => {
  // 1. Ouvrir deux onglets avec le même utilisateur
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  // 2. Se connecter sur les deux onglets
  await login(page1, 'test@moneto.local', 'testpassword123');
  await login(page2, 'test@moneto.local', 'testpassword123');

  // 3. Modifier le même plan sur les deux onglets
  // (simule deux appareils différents)

  // 4. Synchroniser et vérifier que last-write-wins fonctionne

  await context1.close();
  await context2.close();
});
```

### 4. Migration des données locales

```typescript
test('migration des données locales vers cloud', async ({ page }) => {
  // 1. Créer des plans en mode local (sans connexion)
  await page.goto('/dashboard');
  await createLocalPlan(page, '2025-01');
  await createLocalPlan(page, '2025-02');

  // 2. Se connecter
  await page.goto('/auth/login');
  await login(page, 'test@moneto.local', 'testpassword123');

  // 3. Vérifier que la modal de migration apparaît
  await expect(page.locator('text=Synchroniser vos données')).toBeVisible();

  // 4. Cliquer sur "Synchroniser maintenant"
  await page.click('text=Synchroniser maintenant');

  // 5. Attendre la migration
  await expect(page.locator('text=Migration réussie')).toBeVisible();

  // 6. Vérifier que les plans sont dans le cloud
  await page.reload();
  await expect(page.locator('text=2025-01')).toBeVisible();
  await expect(page.locator('text=2025-02')).toBeVisible();
});
```

---

## 🔍 Helpers utiles

### Helper de login

```typescript
async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

### Helper de création de plan local

```typescript
async function createLocalPlan(page: Page, month: string) {
  await page.goto('/dashboard');
  await page.click('text=Créer un nouveau plan');
  // ... remplir le formulaire
  await page.click('text=Enregistrer');
}
```

### Helper de vérification Supabase

```typescript
async function verifyPlanInSupabase(planId: string) {
  const { data } = await supabase
    .from('monthly_plans')
    .select('*')
    .eq('plan_id', planId)
    .single();

  return data !== null;
}
```

---

## 📊 Exécution des tests

### Playwright

```bash
# Exécuter tous les tests
npm run test:e2e

# Exécuter en mode UI (interface graphique)
npm run test:e2e:ui

# Exécuter en mode debug
npm run test:e2e:debug

# Exécuter un seul fichier
npx playwright test auth.spec.ts

# Exécuter avec un navigateur spécifique
npx playwright test --project=chromium
```

### Cypress

```bash
# Ouvrir l'interface Cypress
npm run cypress:open

# Exécuter en headless
npm run cypress:run
```

---

## 🐛 Debugging

### Playwright

```typescript
// Prendre une capture d'écran
await page.screenshot({ path: 'screenshot.png' });

// Enregistrer une vidéo
// (configuré dans playwright.config.ts)

// Mode debug interactif
await page.pause();
```

### Cypress

```typescript
// Pause pour inspecter
cy.pause();

// Log dans la console
cy.log('Message de debug');

// Capture d'écran automatique en cas d'échec
// (par défaut dans Cypress)
```

---

## 📈 Métriques de performance

### Mesurer le temps de chargement

```typescript
test('performance de la page dashboard', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3 secondes max
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions

Créer `.github/workflows/e2e.yml` :

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Cypress Documentation](https://docs.cypress.io)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Next.js E2E Testing](https://nextjs.org/docs/testing)

---

**Moneto V2 - Tests E2E**
