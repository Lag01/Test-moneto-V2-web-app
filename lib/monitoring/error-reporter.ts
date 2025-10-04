/**
 * Service de reporting d'erreurs pour Moneto V2
 *
 * Ce service permet de centraliser la gestion des erreurs de l'application
 * et de les envoyer vers un service de monitoring (Sentry, LogRocket, etc.)
 *
 * Fonctionnalités :
 * - Report d'erreurs avec contexte
 * - Support Sentry (optionnel)
 * - Fallback console.error en développement
 * - Filtrage des erreurs sensibles
 */

interface ErrorContext {
  user?: {
    id: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
  level?: 'fatal' | 'error' | 'warning' | 'info';
}

interface ErrorReporter {
  /**
   * Report une erreur au service de monitoring
   */
  reportError(error: Error, context?: ErrorContext): void;

  /**
   * Report un message personnalisé
   */
  reportMessage(message: string, context?: ErrorContext): void;

  /**
   * Ajoute du contexte global (ex: version de l'app)
   */
  setGlobalContext(context: Record<string, any>): void;

  /**
   * Identifie l'utilisateur courant
   */
  setUser(user: { id: string; email?: string }): void;

  /**
   * Clear l'utilisateur (à la déconnexion)
   */
  clearUser(): void;
}

/**
 * Implémentation Sentry (optionnelle)
 * Nécessite l'installation de @sentry/nextjs
 */
class SentryErrorReporter implements ErrorReporter {
  private Sentry: any;

  constructor() {
    try {
      // Essayer d'importer Sentry (ne crashe pas si non installé)
      this.Sentry = typeof window !== 'undefined'
        ? (window as any).Sentry
        : null;
    } catch (error) {
      console.warn('Sentry n\'est pas configuré');
      this.Sentry = null;
    }
  }

  reportError(error: Error, context?: ErrorContext): void {
    if (!this.Sentry) {
      console.error('Error:', error, context);
      return;
    }

    // Configurer le scope Sentry
    this.Sentry.withScope((scope: any) => {
      // Ajouter les tags
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      // Ajouter le contexte
      if (context?.metadata) {
        scope.setContext('metadata', context.metadata);
      }

      // Ajouter le niveau
      if (context?.level) {
        scope.setLevel(context.level);
      }

      // Capturer l'erreur
      this.Sentry.captureException(error);
    });
  }

  reportMessage(message: string, context?: ErrorContext): void {
    if (!this.Sentry) {
      console.log('Message:', message, context);
      return;
    }

    this.Sentry.withScope((scope: any) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      if (context?.metadata) {
        scope.setContext('metadata', context.metadata);
      }

      const level = context?.level || 'info';
      this.Sentry.captureMessage(message, level);
    });
  }

  setGlobalContext(context: Record<string, any>): void {
    if (!this.Sentry) return;

    Object.entries(context).forEach(([key, value]) => {
      this.Sentry.setTag(key, value);
    });
  }

  setUser(user: { id: string; email?: string }): void {
    if (!this.Sentry) return;

    this.Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }

  clearUser(): void {
    if (!this.Sentry) return;

    this.Sentry.setUser(null);
  }
}

/**
 * Implémentation Console (fallback)
 * Utilisée en développement ou si Sentry n'est pas configuré
 */
class ConsoleErrorReporter implements ErrorReporter {
  private globalContext: Record<string, any> = {};
  private currentUser: { id: string; email?: string } | null = null;

  reportError(error: Error, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const level = context?.level || 'error';

    console.group(`[${level.toUpperCase()}] ${timestamp}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    if (this.currentUser) {
      console.log('User:', this.currentUser);
    }

    if (context?.tags) {
      console.log('Tags:', context.tags);
    }

    if (context?.metadata) {
      console.log('Metadata:', context.metadata);
    }

    if (Object.keys(this.globalContext).length > 0) {
      console.log('Global Context:', this.globalContext);
    }

    console.groupEnd();
  }

  reportMessage(message: string, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const level = context?.level || 'info';

    console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`);

    if (context?.metadata) {
      console.log('Metadata:', context.metadata);
    }
  }

  setGlobalContext(context: Record<string, any>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  setUser(user: { id: string; email?: string }): void {
    this.currentUser = user;
  }

  clearUser(): void {
    this.currentUser = null;
  }
}

/**
 * Factory pour créer le bon reporter selon l'environnement
 */
function createErrorReporter(): ErrorReporter {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isSentryEnabled = process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined;

  if (!isDevelopment && isSentryEnabled) {
    return new SentryErrorReporter();
  }

  return new ConsoleErrorReporter();
}

// Export singleton
export const errorReporter = createErrorReporter();

/**
 * Helpers pour reporter des erreurs de sync spécifiques
 */
export function reportSyncError(error: Error, operation: string, planId?: string) {
  errorReporter.reportError(error, {
    level: 'error',
    tags: {
      category: 'sync',
      operation,
    },
    metadata: {
      planId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function reportAuthError(error: Error, operation: 'login' | 'signup' | 'logout') {
  errorReporter.reportError(error, {
    level: 'warning',
    tags: {
      category: 'auth',
      operation,
    },
  });
}

export function reportDataError(error: Error, context: { planId?: string; operation?: string }) {
  errorReporter.reportError(error, {
    level: 'error',
    tags: {
      category: 'data',
    },
    metadata: context,
  });
}

/**
 * Filtre les erreurs pour éviter de reporter les données sensibles
 */
export function sanitizeErrorMessage(message: string): string {
  // Remplacer les emails
  let sanitized = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');

  // Remplacer les tokens
  sanitized = sanitized.replace(/Bearer\s+[^\s]+/g, 'Bearer [TOKEN_REDACTED]');

  // Remplacer les UUIDs (potentiellement sensibles)
  sanitized = sanitized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[UUID_REDACTED]');

  return sanitized;
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Handler pour les erreurs non catchées
  window.addEventListener('error', (event) => {
    errorReporter.reportError(event.error || new Error(event.message), {
      level: 'error',
      tags: {
        category: 'uncaught',
      },
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Handler pour les promesses rejetées non catchées
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    errorReporter.reportError(error, {
      level: 'error',
      tags: {
        category: 'unhandled-promise',
      },
    });
  });
}

/**
 * Configuration de Sentry (à appeler dans _app.tsx ou layout.tsx)
 *
 * Installation :
 * npm install --save @sentry/nextjs
 *
 * Configuration :
 * 1. Créer un compte Sentry
 * 2. Créer un projet Next.js
 * 3. Ajouter NEXT_PUBLIC_SENTRY_DSN dans .env.local
 * 4. Appeler configureSentry() dans le layout principal
 */
export function configureSentry() {
  if (typeof window === 'undefined') return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.log('Sentry DSN not configured, using console reporter');
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (!Sentry) {
      console.warn('Sentry SDK not loaded');
      return;
    }

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      // Ne pas envoyer les erreurs en dev
      enabled: process.env.NODE_ENV !== 'development',
      // Filtrer les erreurs
      beforeSend(event: any) {
        // Sanitize les messages
        if (event.message) {
          event.message = sanitizeErrorMessage(event.message);
        }

        return event;
      },
    });

    console.log('Sentry configured successfully');
  } catch (error) {
    console.error('Failed to configure Sentry:', error);
  }
}
