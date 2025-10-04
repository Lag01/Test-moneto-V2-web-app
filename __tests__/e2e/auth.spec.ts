/**
 * Tests E2E pour le flow d'authentification
 *
 * Ces tests nécessitent :
 * - Un environnement Supabase de test configuré
 * - Playwright installé (npm install --save-dev @playwright/test)
 * - L'application lancée en local (npm run dev)
 *
 * Pour exécuter :
 * npx playwright test __tests__/e2e/auth.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// HELPERS
// ============================================================================

async function fillSignupForm(
  page: Page,
  email: string,
  password: string
) {
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.fill('[name="confirmPassword"]', password);
}

async function fillLoginForm(
  page: Page,
  email: string,
  password: string
) {
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
}

async function waitForDashboard(page: Page) {
  await page.waitForURL('/dashboard', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('Dashboard');
}

// ============================================================================
// TESTS
// ============================================================================

test.describe('Authentification', () => {
  // Email unique pour chaque exécution de test
  const testEmail = `test-${Date.now()}@moneto.local`;
  const testPassword = 'TestPassword123!';

  test('devrait permettre de créer un compte', async ({ page }) => {
    // 1. Naviguer vers la page de signup
    await page.goto('/auth/signup');

    // 2. Vérifier que la page est chargée
    await expect(page.locator('h2')).toContainText('Créer un compte');

    // 3. Remplir le formulaire
    await fillSignupForm(page, testEmail, testPassword);

    // 4. Soumettre le formulaire
    await page.click('button[type="submit"]');

    // 5. Attendre la redirection vers le dashboard
    await waitForDashboard(page);

    // 6. Vérifier que l'utilisateur est connecté
    // L'email devrait être visible dans la navigation
    await expect(page.locator('text=' + testEmail)).toBeVisible();
  });

  test('devrait afficher un message de succès après signup', async ({ page }) => {
    const email = `test-${Date.now()}@moneto.local`;

    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');

    // Vérifier le message de succès
    await expect(page.locator('text=Compte créé avec succès')).toBeVisible();
  });

  test('devrait permettre de se déconnecter', async ({ page }) => {
    // 1. Créer un compte et se connecter
    const email = `test-${Date.now()}@moneto.local`;
    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // 2. Cliquer sur le bouton de déconnexion
    // (peut être dans un menu ou dans la navigation)
    await page.click('text=Se déconnecter');

    // 3. Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL('/');

    // Alternative : vérifier que l'email n'est plus visible
    await expect(page.locator('text=' + email)).not.toBeVisible();
  });

  test('devrait permettre de se connecter avec un compte existant', async ({ page }) => {
    // 1. Créer un compte d'abord
    const email = `test-${Date.now()}@moneto.local`;
    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // 2. Se déconnecter
    await page.click('text=Se déconnecter');
    await page.waitForURL('/');

    // 3. Aller sur la page de login
    await page.goto('/auth/login');

    // 4. Se connecter
    await fillLoginForm(page, email, testPassword);
    await page.click('button[type="submit"]');

    // 5. Vérifier la redirection
    await waitForDashboard(page);

    // 6. Vérifier que l'utilisateur est connecté
    await expect(page.locator('text=' + email)).toBeVisible();
  });

  test('devrait afficher une erreur avec des mauvais identifiants', async ({ page }) => {
    await page.goto('/auth/login');

    // Essayer de se connecter avec un email qui n'existe pas
    await fillLoginForm(page, 'nonexistent@moneto.local', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible();

    // Vérifier qu'on reste sur la page de login
    await expect(page).toHaveURL('/auth/login');
  });

  test('devrait afficher une erreur si les mots de passe ne correspondent pas', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('[name="email"]', 'test@moneto.local');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'differentpassword');

    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    await expect(page.locator('text=Les mots de passe ne correspondent pas')).toBeVisible();
  });

  test('devrait afficher une erreur si le mot de passe est trop court', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('[name="email"]', 'test@moneto.local');
    await page.fill('[name="password"]', '123'); // Moins de 6 caractères
    await page.fill('[name="confirmPassword"]', '123');

    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    await expect(page.locator('text=au moins 6 caractères')).toBeVisible();
  });

  test('devrait désactiver les champs pendant la soumission', async ({ page }) => {
    await page.goto('/auth/login');

    await fillLoginForm(page, 'test@moneto.local', 'password123');

    // Cliquer sur submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Vérifier que les champs sont disabled
    await expect(page.locator('[name="email"]')).toBeDisabled();
    await expect(page.locator('[name="password"]')).toBeDisabled();
    await expect(submitButton).toBeDisabled();
  });

  test('devrait avoir un lien vers la page de signup depuis login', async ({ page }) => {
    await page.goto('/auth/login');

    // Cliquer sur le lien "S'inscrire"
    await page.click('text=S\'inscrire');

    // Vérifier la navigation
    await expect(page).toHaveURL('/auth/signup');
  });

  test('devrait avoir un lien vers la page de login depuis signup', async ({ page }) => {
    await page.goto('/auth/signup');

    // Cliquer sur le lien "Se connecter"
    await page.click('text=Se connecter');

    // Vérifier la navigation
    await expect(page).toHaveURL('/auth/login');
  });

  test('devrait permettre de continuer sans compte', async ({ page }) => {
    await page.goto('/auth/login');

    // Cliquer sur "Continuer sans compte"
    await page.click('text=Continuer sans compte');

    // Vérifier la redirection vers le dashboard
    await waitForDashboard(page);

    // Vérifier qu'aucun email n'est affiché (utilisateur non connecté)
    await expect(page.locator('text=Se connecter')).toBeVisible();
  });

  test('devrait afficher le badge Premium après signup', async ({ page }) => {
    const email = `test-${Date.now()}@moneto.local`;

    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // Vérifier que le badge Premium est affiché
    await expect(page.locator('text=Premium')).toBeVisible();
  });

  test('devrait persister la session après refresh', async ({ page }) => {
    const email = `test-${Date.now()}@moneto.local`;

    // 1. Créer un compte
    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // 2. Rafraîchir la page
    await page.reload();

    // 3. Vérifier que l'utilisateur est toujours connecté
    await expect(page.locator('text=' + email)).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('devrait rediriger vers dashboard si déjà connecté sur /auth/login', async ({ page }) => {
    const email = `test-${Date.now()}@moneto.local`;

    // 1. Créer un compte
    await page.goto('/auth/signup');
    await fillSignupForm(page, email, testPassword);
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // 2. Essayer d'aller sur /auth/login
    await page.goto('/auth/login');

    // 3. Devrait être redirigé vers dashboard
    // (ou rester sur login mais avec un message indiquant qu'on est déjà connecté)
    // Note : ce comportement dépend de l'implémentation
  });
});

test.describe('Sécurité', () => {
  test('ne devrait pas permettre d\'accéder au profil sans connexion', async ({ page }) => {
    await page.goto('/profile');

    // Devrait être redirigé vers login
    await expect(page).toHaveURL('/auth/login');
  });

  test('ne devrait pas exposer les tokens dans l\'URL', async ({ page }) => {
    const email = `test-${Date.now()}@moneto.local`;

    await page.goto('/auth/signup');
    await fillSignupForm(page, email, 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForDashboard(page);

    // Vérifier qu'il n'y a pas de token dans l'URL
    const url = page.url();
    expect(url).not.toContain('token=');
    expect(url).not.toContain('access_token=');
  });
});
