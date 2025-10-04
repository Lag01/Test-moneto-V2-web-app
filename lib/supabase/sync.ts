import { supabase, isSupabaseConfigured } from './client';
import type { MonthlyPlan } from '@/store';
import { monthlyPlanToRow, rowToMonthlyPlan } from './types';
import type { MonthlyPlanUpdate } from './types';
import { syncLogger } from '@/lib/diagnostics/sync-logger';
import { performanceTracker } from '@/lib/diagnostics/performance-tracker';

/**
 * Résultat d'une opération de synchronisation
 */
export interface SyncResult {
  success: boolean;
  error?: string;
  synced?: number; // Nombre de plans synchronisés
}

/**
 * Résultat d'un téléchargement de plans
 */
export interface DownloadResult {
  success: boolean;
  plans?: MonthlyPlan[];
  error?: string;
}

/**
 * Configuration du debouncing
 */
let syncTimeout: NodeJS.Timeout | null = null;
const SYNC_DEBOUNCE_MS = 2000; // 2 secondes de délai

/**
 * Upload un plan mensuel vers Supabase
 *
 * @param plan - Le plan à uploader
 * @param userId - L'ID de l'utilisateur
 * @returns Résultat de l'opération
 */
export async function uploadPlanToCloud(
  plan: MonthlyPlan,
  userId: string
): Promise<SyncResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'La synchronisation cloud n\'est pas configurée',
    };
  }

  const operationId = `upload-${plan.id}-${Date.now()}`;
  performanceTracker.start(operationId, 'uploadPlan', { planId: plan.id, userId });

  try {
    syncLogger.log({
      operation: 'upload',
      planId: plan.id,
      status: 'success',
      message: `Début upload du plan ${plan.month}`,
    });

    // Convertir le plan au format DB
    const planRow = monthlyPlanToRow(plan, userId);

    // Vérifier si le plan existe déjà
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase
      .from('monthly_plans')
      .select('id, updated_at')
      .eq('user_id', userId)
      .eq('plan_id', plan.id)
      .single() as any);

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = pas de résultat, c'est OK
      console.error('Erreur lors de la vérification du plan existant:', fetchError);

      syncLogger.log({
        operation: 'upload',
        planId: plan.id,
        status: 'error',
        message: 'Erreur lors de la vérification du plan existant',
        details: { error: fetchError },
      });

      performanceTracker.end(operationId, { success: false });

      return {
        success: false,
        error: 'Erreur lors de la vérification du plan existant',
      };
    }

    if (existing) {
      // Mise à jour du plan existant
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('monthly_plans') as any)
        .update({
          name: planRow.name,
          data: planRow.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du plan:', updateError);

        syncLogger.log({
          operation: 'upload',
          planId: plan.id,
          status: 'error',
          message: 'Erreur lors de la mise à jour du plan',
          details: { error: updateError },
        });

        performanceTracker.end(operationId, { success: false });

        return {
          success: false,
          error: 'Erreur lors de la mise à jour du plan',
        };
      }

      syncLogger.log({
        operation: 'upload',
        planId: plan.id,
        status: 'success',
        message: `Plan ${plan.month} mis à jour avec succès`,
      });
    } else {
      // Insertion d'un nouveau plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('monthly_plans') as any)
        .insert(planRow);

      if (insertError) {
        console.error('Erreur lors de l\'insertion du plan:', insertError);

        syncLogger.log({
          operation: 'upload',
          planId: plan.id,
          status: 'error',
          message: 'Erreur lors de l\'insertion du plan',
          details: { error: insertError },
        });

        performanceTracker.end(operationId, { success: false });

        return {
          success: false,
          error: 'Erreur lors de l\'insertion du plan',
        };
      }

      syncLogger.log({
        operation: 'upload',
        planId: plan.id,
        status: 'success',
        message: `Nouveau plan ${plan.month} inséré avec succès`,
      });
    }

    const duration = performanceTracker.end(operationId, { success: true });

    syncLogger.log({
      operation: 'upload',
      planId: plan.id,
      status: 'success',
      message: `Plan ${plan.month} uploadé avec succès`,
      duration: duration || undefined,
    });

    return {
      success: true,
      synced: 1,
    };
  } catch (error) {
    console.error('Erreur inattendue lors de l\'upload:', error);

    syncLogger.log({
      operation: 'upload',
      planId: plan.id,
      status: 'error',
      message: 'Erreur inattendue lors de l\'upload',
      details: { error },
    });

    performanceTracker.end(operationId, { success: false });

    return {
      success: false,
      error: 'Erreur inattendue lors de l\'upload',
    };
  }
}

/**
 * Télécharge tous les plans de l'utilisateur depuis Supabase
 *
 * @param userId - L'ID de l'utilisateur
 * @returns Les plans téléchargés
 */
export async function downloadPlansFromCloud(
  userId: string
): Promise<DownloadResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'La synchronisation cloud n\'est pas configurée',
    };
  }

  const operationId = `download-${userId}-${Date.now()}`;
  performanceTracker.start(operationId, 'downloadPlans', { userId });

  try {
    syncLogger.log({
      operation: 'download',
      status: 'success',
      message: 'Début téléchargement des plans depuis le cloud',
      details: { userId },
    });

    const { data, error } = await supabase
      .from('monthly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du téléchargement des plans:', error);

      syncLogger.log({
        operation: 'download',
        status: 'error',
        message: 'Erreur lors du téléchargement des plans',
        details: { error },
      });

      performanceTracker.end(operationId, { success: false });

      return {
        success: false,
        error: 'Erreur lors du téléchargement des plans',
      };
    }

    // Convertir les rows en plans
    const plans = (data || []).map(rowToMonthlyPlan);

    const duration = performanceTracker.end(operationId, { success: true, count: plans.length });

    syncLogger.log({
      operation: 'download',
      status: 'success',
      message: `${plans.length} plans téléchargés avec succès`,
      duration: duration || undefined,
      details: { count: plans.length },
    });

    return {
      success: true,
      plans,
    };
  } catch (error) {
    console.error('Erreur inattendue lors du téléchargement:', error);

    syncLogger.log({
      operation: 'download',
      status: 'error',
      message: 'Erreur inattendue lors du téléchargement',
      details: { error },
    });

    performanceTracker.end(operationId, { success: false });

    return {
      success: false,
      error: 'Erreur inattendue lors du téléchargement',
    };
  }
}

/**
 * Synchronise un plan avec gestion des conflits (last-write-wins)
 * Compare les timestamps updated_at pour décider quelle version garder
 *
 * @param localPlan - Le plan local
 * @param userId - L'ID de l'utilisateur
 * @returns Le plan à utiliser (local ou distant) et le résultat de la sync
 */
export async function syncPlan(
  localPlan: MonthlyPlan,
  userId: string
): Promise<{ success: boolean; plan?: MonthlyPlan; error?: string; conflict?: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'La synchronisation cloud n\'est pas configurée',
    };
  }

  try {
    // Récupérer le plan distant
    const { data: remotePlanRow, error: fetchError } = await supabase
      .from('monthly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', localPlan.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération du plan distant:', fetchError);
      return {
        success: false,
        error: 'Erreur lors de la récupération du plan distant',
      };
    }

    // Si le plan n'existe pas sur le cloud, on l'upload
    if (!remotePlanRow) {
      const uploadResult = await uploadPlanToCloud(localPlan, userId);
      return {
        success: uploadResult.success,
        plan: localPlan,
        error: uploadResult.error,
      };
    }

    // Convertir le plan distant
    const remotePlan = rowToMonthlyPlan(remotePlanRow);

    // Comparer les timestamps pour détecter un conflit
    const localUpdatedAt = new Date(localPlan.updatedAt).getTime();
    const remoteUpdatedAt = new Date(remotePlan.updatedAt).getTime();

    // Last-write-wins : garder le plus récent
    if (remoteUpdatedAt > localUpdatedAt) {
      // Le plan distant est plus récent, on le retourne
      console.log(`Conflit détecté pour le plan ${localPlan.id} : version distante plus récente`);

      syncLogger.log({
        operation: 'conflict',
        planId: localPlan.id,
        status: 'warning',
        message: `Conflit résolu : version distante gardée (${remotePlan.month})`,
        details: {
          localUpdatedAt,
          remoteUpdatedAt,
          resolution: 'remote',
        },
      });

      return {
        success: true,
        plan: remotePlan,
        conflict: true,
      };
    } else if (localUpdatedAt > remoteUpdatedAt) {
      // Le plan local est plus récent, on l'upload
      console.log(`Conflit détecté pour le plan ${localPlan.id} : version locale plus récente`);

      syncLogger.log({
        operation: 'conflict',
        planId: localPlan.id,
        status: 'warning',
        message: `Conflit résolu : version locale gardée (${localPlan.month})`,
        details: {
          localUpdatedAt,
          remoteUpdatedAt,
          resolution: 'local',
        },
      });

      const uploadResult = await uploadPlanToCloud(localPlan, userId);
      return {
        success: uploadResult.success,
        plan: localPlan,
        error: uploadResult.error,
        conflict: true,
      };
    } else {
      // Timestamps identiques, pas de conflit
      syncLogger.log({
        operation: 'sync',
        planId: localPlan.id,
        status: 'success',
        message: `Plan ${localPlan.month} déjà à jour (timestamps identiques)`,
      });

      return {
        success: true,
        plan: localPlan,
      };
    }
  } catch (error) {
    console.error('Erreur inattendue lors de la sync du plan:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors de la sync',
    };
  }
}

/**
 * Supprime un plan du cloud
 *
 * @param planId - L'ID du plan à supprimer
 * @param userId - L'ID de l'utilisateur
 * @returns Résultat de l'opération
 */
export async function deletePlanFromCloud(
  planId: string,
  userId: string
): Promise<SyncResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'La synchronisation cloud n\'est pas configurée',
    };
  }

  const operationId = `delete-${planId}-${Date.now()}`;
  performanceTracker.start(operationId, 'deletePlan', { planId, userId });

  try {
    syncLogger.log({
      operation: 'delete',
      planId,
      status: 'success',
      message: `Début suppression du plan ${planId}`,
    });

    const { error } = await supabase
      .from('monthly_plans')
      .delete()
      .eq('user_id', userId)
      .eq('plan_id', planId);

    if (error) {
      console.error('Erreur lors de la suppression du plan:', error);

      syncLogger.log({
        operation: 'delete',
        planId,
        status: 'error',
        message: 'Erreur lors de la suppression du plan',
        details: { error },
      });

      performanceTracker.end(operationId, { success: false });

      return {
        success: false,
        error: 'Erreur lors de la suppression du plan',
      };
    }

    const duration = performanceTracker.end(operationId, { success: true });

    syncLogger.log({
      operation: 'delete',
      planId,
      status: 'success',
      message: `Plan ${planId} supprimé avec succès`,
      duration: duration || undefined,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la suppression:', error);

    syncLogger.log({
      operation: 'delete',
      planId,
      status: 'error',
      message: 'Erreur inattendue lors de la suppression',
      details: { error },
    });

    performanceTracker.end(operationId, { success: false });

    return {
      success: false,
      error: 'Erreur inattendue lors de la suppression',
    };
  }
}

/**
 * Synchronise tous les plans locaux avec le cloud
 * Gère les conflits avec la stratégie last-write-wins
 *
 * @param localPlans - Les plans locaux à synchroniser
 * @param userId - L'ID de l'utilisateur
 * @param onProgress - Callback pour suivre la progression (optionnel)
 * @returns Résultat global de la synchronisation et les plans mis à jour
 */
export async function syncAllPlans(
  localPlans: MonthlyPlan[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{
  success: boolean;
  plans?: MonthlyPlan[];
  synced?: number;
  conflicts?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'La synchronisation cloud n\'est pas configurée',
    };
  }

  const operationId = `syncAll-${userId}-${Date.now()}`;
  performanceTracker.start(operationId, 'syncAllPlans', { userId, count: localPlans.length });

  try {
    syncLogger.log({
      operation: 'sync',
      status: 'success',
      message: `Début synchronisation de ${localPlans.length} plans`,
      details: { count: localPlans.length },
    });

    const updatedPlans: MonthlyPlan[] = [];
    let syncedCount = 0;
    let conflictCount = 0;

    // Synchroniser chaque plan
    for (let i = 0; i < localPlans.length; i++) {
      const plan = localPlans[i];

      if (onProgress) {
        onProgress(i + 1, localPlans.length);
      }

      const result = await syncPlan(plan, userId);

      if (result.success && result.plan) {
        updatedPlans.push(result.plan);
        syncedCount++;
        if (result.conflict) {
          conflictCount++;
        }
      } else {
        // En cas d'erreur, garder le plan local
        console.error(`Erreur lors de la sync du plan ${plan.id}:`, result.error);
        updatedPlans.push(plan);
      }
    }

    // Télécharger les plans qui n'existent que sur le cloud
    const downloadResult = await downloadPlansFromCloud(userId);
    if (downloadResult.success && downloadResult.plans) {
      const localPlanIds = new Set(localPlans.map((p) => p.id));
      const cloudOnlyPlans = downloadResult.plans.filter(
        (p) => !localPlanIds.has(p.id)
      );
      updatedPlans.push(...cloudOnlyPlans);

      if (cloudOnlyPlans.length > 0) {
        syncLogger.log({
          operation: 'sync',
          status: 'success',
          message: `${cloudOnlyPlans.length} plans cloud-only récupérés`,
          details: { count: cloudOnlyPlans.length },
        });
      }
    }

    const duration = performanceTracker.end(operationId, {
      success: true,
      synced: syncedCount,
      conflicts: conflictCount,
    });

    syncLogger.log({
      operation: 'sync',
      status: 'success',
      message: `Synchronisation globale réussie : ${syncedCount} plans synchronisés, ${conflictCount} conflits résolus`,
      duration: duration || undefined,
      details: { synced: syncedCount, conflicts: conflictCount, total: updatedPlans.length },
    });

    return {
      success: true,
      plans: updatedPlans,
      synced: syncedCount,
      conflicts: conflictCount,
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la sync globale:', error);

    syncLogger.log({
      operation: 'sync',
      status: 'error',
      message: 'Erreur inattendue lors de la synchronisation globale',
      details: { error },
    });

    performanceTracker.end(operationId, { success: false });

    return {
      success: false,
      error: 'Erreur inattendue lors de la synchronisation',
    };
  }
}

/**
 * Synchronise avec debouncing
 * Retarde la synchronisation pour éviter trop d'appels successifs
 *
 * @param callback - Fonction à appeler après le délai
 */
export function debouncedSync(callback: () => void): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    callback();
    syncTimeout = null;
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Retry logic : réessaye une opération en cas d'échec
 *
 * @param operation - L'opération à réessayer
 * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @param delayMs - Délai entre chaque tentative en ms (défaut: 1000)
 * @returns Le résultat de l'opération
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error);

      if (attempt < maxRetries) {
        // Attendre avant de réessayer (avec backoff exponentiel)
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  // Toutes les tentatives ont échoué
  throw lastError;
}
