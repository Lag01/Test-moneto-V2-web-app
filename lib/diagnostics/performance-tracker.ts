/**
 * Tracker de performance pour les opérations de synchronisation
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private maxHistory = 100;

  /**
   * Démarre le tracking d'une opération
   */
  start(operationId: string, operationName: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation: operationName,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(operationId, metric);
  }

  /**
   * Termine le tracking d'une opération
   */
  end(operationId: string, additionalMetadata?: Record<string, any>): number | null {
    const metric = this.metrics.get(operationId);

    if (!metric) {
      console.warn(`Performance metric not found for operation: ${operationId}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Déplacer vers l'historique
    this.completedMetrics.push(metric);
    this.metrics.delete(operationId);

    // Limiter l'historique
    if (this.completedMetrics.length > this.maxHistory) {
      this.completedMetrics = this.completedMetrics.slice(-this.maxHistory);
    }

    return metric.duration;
  }

  /**
   * Récupère les métriques complétées
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  /**
   * Récupère les statistiques d'une opération
   */
  getStats(operationName: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
  } | null {
    const relevantMetrics = this.completedMetrics.filter((m) => m.operation === operationName);

    if (relevantMetrics.length === 0) {
      return null;
    }

    const durations = relevantMetrics.map((m) => m.duration!);

    return {
      count: relevantMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }

  /**
   * Récupère toutes les statistiques
   */
  getAllStats(): Record<string, any> {
    const operations = [...new Set(this.completedMetrics.map((m) => m.operation))];

    return operations.reduce((acc, op) => {
      acc[op] = this.getStats(op);
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Efface toutes les métriques
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * Exporte les métriques au format JSON
   */
  export(): string {
    return JSON.stringify({
      inProgress: Array.from(this.metrics.values()),
      completed: this.completedMetrics,
      stats: this.getAllStats(),
    }, null, 2);
  }
}

// Export singleton
export const performanceTracker = new PerformanceTracker();
