'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import PlanSyncStatusBadge from './PlanSyncStatusBadge';
import type { CloudPlanMetadata } from '@/lib/supabase/types';

interface SyncManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncManagementModal({ isOpen, onClose }: SyncManagementModalProps) {
  const user = useAppStore((state) => state.user);
  const monthlyPlans = useAppStore((state) => state.monthlyPlans);
  const planSyncStatus = useAppStore((state) => state.planSyncStatus);
  const refreshPlansSyncStatus = useAppStore((state) => state.refreshPlansSyncStatus);
  const uploadSelectedPlansToCloud = useAppStore((state) => state.uploadSelectedPlansToCloud);
  const downloadSelectedPlansFromCloud = useAppStore((state) => state.downloadSelectedPlansFromCloud);
  const deleteSelectedPlansFromCloud = useAppStore((state) => state.deleteSelectedPlansFromCloud);
  const getCloudPlansMetadata = useAppStore((state) => state.getCloudPlansMetadata);

  const [isLoading, setIsLoading] = useState(false);
  const [cloudPlans, setCloudPlans] = useState<CloudPlanMetadata[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<Set<string>>(new Set());
  const [selectedCloud, setSelectedCloud] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Rafraîchir le statut de sync
      await refreshPlansSyncStatus();

      // Récupérer les métadonnées cloud
      const result = await getCloudPlansMetadata();
      if (result.success && result.plans) {
        setCloudPlans(result.plans);
      } else {
        setError(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur inattendue lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [refreshPlansSyncStatus, getCloudPlansMetadata]);

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user, loadData]);

  const handleUploadSelected = async () => {
    if (selectedLocal.size === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadSelectedPlansToCloud(Array.from(selectedLocal));

      if (result.success) {
        setSuccess(`${result.uploaded} plan(s) uploadé(s) avec succès`);
        setSelectedLocal(new Set());
        await loadData();
      } else {
        setError(`Erreur : ${result.errors?.join(', ')}`);
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      setError('Erreur inattendue lors de l\'upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedCloud.size === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await downloadSelectedPlansFromCloud(Array.from(selectedCloud));

      if (result.success) {
        setSuccess(`${result.downloaded} plan(s) téléchargé(s) avec succès`);
        setSelectedCloud(new Set());
        await loadData();
      } else {
        setError(`Erreur : ${result.errors?.join(', ')}`);
      }
    } catch (err) {
      console.error('Erreur download:', err);
      setError('Erreur inattendue lors du téléchargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCloud.size === 0) return;

    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedCloud.size} plan(s) du cloud ?`
    );
    if (!confirm) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteSelectedPlansFromCloud(Array.from(selectedCloud));

      if (result.success) {
        setSuccess(`${result.deleted} plan(s) supprimé(s) avec succès`);
        setSelectedCloud(new Set());
        await loadData();
      } else {
        setError(`Erreur : ${result.errors?.join(', ')}`);
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError('Erreur inattendue lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Uploader tous les plans non synchronisés
      const plansToUpload = monthlyPlans
        .filter((p) => {
          const status = planSyncStatus[p.id]?.status;
          return status === 'not_synced' || status === 'local_newer';
        })
        .map((p) => p.id);

      if (plansToUpload.length > 0) {
        await uploadSelectedPlansToCloud(plansToUpload);
      }

      // Télécharger tous les plans cloud-only
      const cloudOnlyPlans = Object.values(planSyncStatus)
        .filter((s) => s.status === 'cloud_only')
        .map((s) => s.planId);

      if (cloudOnlyPlans.length > 0) {
        await downloadSelectedPlansFromCloud(cloudOnlyPlans);
      }

      setSuccess('Synchronisation complète réussie');
      await loadData();
    } catch (err) {
      console.error('Erreur sync complète:', err);
      setError('Erreur lors de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLocalSelection = (planId: string) => {
    const newSet = new Set(selectedLocal);
    if (newSet.has(planId)) {
      newSet.delete(planId);
    } else {
      newSet.add(planId);
    }
    setSelectedLocal(newSet);
  };

  const toggleCloudSelection = (planId: string) => {
    const newSet = new Set(selectedCloud);
    if (newSet.has(planId)) {
      newSet.delete(planId);
    } else {
      newSet.add(planId);
    }
    setSelectedCloud(newSet);
  };

  const getMonthLabel = (month: string) => {
    const monthDate = new Date(month + '-01');
    return monthDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Séparer les plans locaux selon leur statut
  const localPlansWithStatus = monthlyPlans.map((plan) => ({
    plan,
    syncInfo: planSyncStatus[plan.id],
  }));

  // Identifier les plans cloud-only
  const cloudOnlyPlans = cloudPlans.filter((cloudPlan) => {
    const status = planSyncStatus[cloudPlan.planId]?.status;
    return status === 'cloud_only';
  });

  if (!isOpen) return null;
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Gestion de la synchronisation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gérez vos plans mensuels entre local et cloud
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Plans locaux */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    📱 Plans locaux ({localPlansWithStatus.length})
                  </h3>
                  {selectedLocal.size > 0 && (
                    <button
                      onClick={handleUploadSelected}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm rounded-lg transition-colors"
                    >
                      ⬆️ Uploader ({selectedLocal.size})
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {localPlansWithStatus.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                      Aucun plan local
                    </p>
                  ) : (
                    localPlansWithStatus.map(({ plan, syncInfo }) => (
                      <div
                        key={plan.id}
                        className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLocal.has(plan.id)}
                            onChange={() => toggleLocalSelection(plan.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                                {getMonthLabel(plan.month)}
                              </h4>
                              {syncInfo && <PlanSyncStatusBadge status={syncInfo.status} />}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                              <p>Dernière modif locale : {new Date(plan.updatedAt).toLocaleString('fr-FR')}</p>
                              {syncInfo?.cloudUpdatedAt && (
                                <p>Dernière modif cloud : {syncInfo.cloudUpdatedAt.toLocaleString('fr-FR')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Plans cloud uniquement */}
              {cloudOnlyPlans.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      ☁️ Plans cloud uniquement ({cloudOnlyPlans.length})
                    </h3>
                    <div className="flex gap-2">
                      {selectedCloud.size > 0 && (
                        <>
                          <button
                            onClick={handleDownloadSelected}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
                          >
                            ⬇️ Importer ({selectedCloud.size})
                          </button>
                          <button
                            onClick={handleDeleteSelected}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
                          >
                            🗑️ Supprimer ({selectedCloud.size})
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cloudOnlyPlans.map((cloudPlan) => (
                      <div
                        key={cloudPlan.planId}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCloud.has(cloudPlan.planId)}
                            onChange={() => toggleCloudSelection(cloudPlan.planId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                                {getMonthLabel(cloudPlan.month)}
                              </h4>
                              <PlanSyncStatusBadge status="cloud_only" />
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              <p>Dernière modif : {new Date(cloudPlan.updatedAt).toLocaleString('fr-FR')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between">
          <button
            onClick={handleSyncAll}
            disabled={isLoading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Tout synchroniser
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
