/**
 * Logger pour les opérations de synchronisation
 */

export interface SyncLogEntry {
  id: string;
  timestamp: Date;
  operation: 'upload' | 'download' | 'sync' | 'delete' | 'conflict';
  planId?: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: Record<string, any>;
  duration?: number;
}

class SyncLogger {
  private logs: SyncLogEntry[] = [];
  private maxLogs = 100; // Garder seulement les 100 derniers logs

  /**
   * Ajoute une entrée de log
   */
  log(entry: Omit<SyncLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: SyncLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };

    this.logs.push(logEntry);

    // Limiter la taille du log
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log dans la console en développement
    if (process.env.NODE_ENV === 'development') {
      const emoji = entry.status === 'success' ? '✅' : entry.status === 'error' ? '❌' : '⚠️';
      console.log(`${emoji} [${entry.operation}] ${entry.message}`, entry.details || '');
    }
  }

  /**
   * Récupère tous les logs
   */
  getLogs(): SyncLogEntry[] {
    return [...this.logs];
  }

  /**
   * Récupère les N derniers logs
   */
  getRecentLogs(count: number = 20): SyncLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Filtre les logs par opération
   */
  getLogsByOperation(operation: SyncLogEntry['operation']): SyncLogEntry[] {
    return this.logs.filter((log) => log.operation === operation);
  }

  /**
   * Filtre les logs par statut
   */
  getLogsByStatus(status: SyncLogEntry['status']): SyncLogEntry[] {
    return this.logs.filter((log) => log.status === status);
  }

  /**
   * Récupère les logs de conflits
   */
  getConflictLogs(): SyncLogEntry[] {
    return this.getLogsByOperation('conflict');
  }

  /**
   * Récupère les logs d'erreur
   */
  getErrorLogs(): SyncLogEntry[] {
    return this.getLogsByStatus('error');
  }

  /**
   * Efface tous les logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Exporte les logs au format JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton
export const syncLogger = new SyncLogger();
