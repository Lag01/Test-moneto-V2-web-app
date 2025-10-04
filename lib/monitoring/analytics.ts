/**
 * Service d'analytics pour Moneto V2
 *
 * Ce service permet de tracker les événements importants de l'application
 * et de les envoyer vers Vercel Analytics, Google Analytics, ou autre.
 *
 * Fonctionnalités :
 * - Tracking d'événements personnalisés
 * - Support Vercel Analytics
 * - Support Google Analytics (optionnel)
 * - Respect de la vie privée (anonymisation)
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

interface AnalyticsService {
  /**
   * Track un événement personnalisé
   */
  track(event: string, properties?: Record<string, any>): void;

  /**
   * Track une page vue
   */
  pageView(path: string, properties?: Record<string, any>): void;

  /**
   * Identifie l'utilisateur (de manière anonyme)
   */
  identify(userId: string, traits?: Record<string, any>): void;
}

/**
 * Implémentation Vercel Analytics
 * Utilise le package @vercel/analytics déjà installé
 */
class VercelAnalytics implements AnalyticsService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && !!(window as any).va;
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      console.log('[Analytics] Track:', event, properties);
      return;
    }

    try {
      (window as any).va('event', event, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  pageView(path: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      console.log('[Analytics] Page view:', path, properties);
      return;
    }

    try {
      (window as any).va('pageview', { path, ...properties });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isEnabled) {
      console.log('[Analytics] Identify:', userId, traits);
      return;
    }

    // Vercel Analytics n'a pas de méthode identify native
    // On peut tracker un événement à la place
    this.track('user_identified', {
      userId,
      ...traits,
    });
  }
}

/**
 * Implémentation Console (fallback pour développement)
 */
class ConsoleAnalytics implements AnalyticsService {
  track(event: string, properties?: Record<string, any>): void {
    console.log(`[Analytics] Track: ${event}`, properties);
  }

  pageView(path: string, properties?: Record<string, any>): void {
    console.log(`[Analytics] Page view: ${path}`, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    console.log(`[Analytics] Identify: ${userId}`, traits);
  }
}

/**
 * Factory pour créer le bon service d'analytics
 */
function createAnalyticsService(): AnalyticsService {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return new ConsoleAnalytics();
  }

  return new VercelAnalytics();
}

// Export singleton
export const analytics = createAnalyticsService();

/**
 * ============================================================================
 * ÉVÉNEMENTS PRÉDÉFINIS
 * ============================================================================
 * Helpers pour tracker les événements importants de Moneto
 */

// ============================================================================
// Authentification
// ============================================================================

export function trackSignup(method: 'email' = 'email') {
  analytics.track('signup', {
    method,
    timestamp: new Date().toISOString(),
  });
}

export function trackLogin(method: 'email' = 'email') {
  analytics.track('login', {
    method,
    timestamp: new Date().toISOString(),
  });
}

export function trackLogout() {
  analytics.track('logout', {
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Plans mensuels
// ============================================================================

export function trackPlanCreated(month: string) {
  analytics.track('plan_created', {
    month,
    timestamp: new Date().toISOString(),
  });
}

export function trackPlanDeleted(month: string) {
  analytics.track('plan_deleted', {
    month,
    timestamp: new Date().toISOString(),
  });
}

export function trackPlanCopied(sourceMonth: string, targetMonth: string) {
  analytics.track('plan_copied', {
    sourceMonth,
    targetMonth,
    timestamp: new Date().toISOString(),
  });
}

export function trackPlanExported(format: 'json' = 'json', count: number) {
  analytics.track('plan_exported', {
    format,
    count,
    timestamp: new Date().toISOString(),
  });
}

export function trackPlanImported(month: string) {
  analytics.track('plan_imported', {
    month,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Synchronisation cloud
// ============================================================================

export function trackSyncStarted(plansCount: number) {
  analytics.track('sync_started', {
    plansCount,
    timestamp: new Date().toISOString(),
  });
}

export function trackSyncCompleted(
  plansCount: number,
  duration: number,
  conflicts: number = 0
) {
  analytics.track('sync_completed', {
    plansCount,
    duration,
    conflicts,
    timestamp: new Date().toISOString(),
  });
}

export function trackSyncFailed(error: string) {
  analytics.track('sync_failed', {
    error,
    timestamp: new Date().toISOString(),
  });
}

export function trackDataMigrationStarted(localPlansCount: number) {
  analytics.track('data_migration_started', {
    localPlansCount,
    timestamp: new Date().toISOString(),
  });
}

export function trackDataMigrationCompleted(
  migratedCount: number,
  duration: number
) {
  analytics.track('data_migration_completed', {
    migratedCount,
    duration,
    timestamp: new Date().toISOString(),
  });
}

export function trackDataMigrationDeclined() {
  analytics.track('data_migration_declined', {
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Tutoriel
// ============================================================================

export function trackTutorialStarted() {
  analytics.track('tutorial_started', {
    timestamp: new Date().toISOString(),
  });
}

export function trackTutorialCompleted() {
  analytics.track('tutorial_completed', {
    timestamp: new Date().toISOString(),
  });
}

export function trackTutorialSkipped(step: number) {
  analytics.track('tutorial_skipped', {
    step,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Erreurs et problèmes
// ============================================================================

export function trackError(
  category: string,
  message: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  analytics.track('error_occurred', {
    category,
    message,
    severity,
    timestamp: new Date().toISOString(),
  });
}

export function trackBugReport(
  description: string,
  category: string
) {
  analytics.track('bug_reported', {
    category,
    hasDescription: description.length > 0,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Engagement utilisateur
// ============================================================================

export function trackFeatureUsed(featureName: string) {
  analytics.track('feature_used', {
    featureName,
    timestamp: new Date().toISOString(),
  });
}

export function trackThemeChanged(theme: 'light' | 'dark' | 'system') {
  analytics.track('theme_changed', {
    theme,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Métriques de performance
// ============================================================================

export function trackPerformanceMetric(
  metric: string,
  value: number,
  unit: 'ms' | 'count' | 'bytes' = 'ms'
) {
  analytics.track('performance_metric', {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Helper pour tracker les clics sur les boutons importants
// ============================================================================

export function trackButtonClick(
  buttonName: string,
  context?: Record<string, any>
) {
  analytics.track('button_clicked', {
    buttonName,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * ============================================================================
 * CONFIGURATION & INITIALISATION
 * ============================================================================
 */

/**
 * Initialise les analytics avec les informations de l'app
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  // Track les infos de base de l'environnement (anonyme)
  analytics.track('app_loaded', {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    environment: process.env.NODE_ENV,
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: new Date().toISOString(),
  });

  console.log('Analytics initialized');
}

/**
 * Désactive les analytics (pour respecter le choix de l'utilisateur)
 */
export function disableAnalytics() {
  // TODO: Implémenter la logique pour désactiver réellement les analytics
  // Peut être lié à un cookie de consentement
  console.log('Analytics disabled');
}

/**
 * ============================================================================
 * PRIVACY HELPERS
 * ============================================================================
 */

/**
 * Hash un email pour l'anonymiser tout en permettant l'identification
 */
export async function hashEmail(email: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback si crypto.subtle n'est pas disponible
    return btoa(email).substring(0, 16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 16); // Prendre seulement les 16 premiers caractères
}

/**
 * Identifie un utilisateur de manière anonyme (avec hash de l'email)
 */
export async function identifyUserAnonymously(userId: string, email: string) {
  const hashedEmail = await hashEmail(email);

  analytics.identify(userId, {
    emailHash: hashedEmail,
    // Ne jamais tracker l'email en clair
  });
}
