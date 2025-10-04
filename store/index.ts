import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { User } from '@/lib/supabase/auth';
import type { PlanSyncInfo, CloudPlanMetadata } from '@/lib/supabase/types';

/**
 * Types pour les transactions
 */
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

/**
 * Types pour les catégories
 */
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

/**
 * Types pour les éléments fixes (revenus ou dépenses)
 */
export interface FixedItem {
  id: string;
  name: string;
  amount: number;
}

/**
 * Types pour les enveloppes d'allocation
 */
export interface Envelope {
  id: string;
  name: string;
  type: 'percentage' | 'fixed'; // percentage: en % du reste, fixed: montant fixe en euros
  percentage: number; // Utilisé seulement si type='percentage'
  amount: number; // Montant calculé (percentage) ou fixé (fixed)
}

/**
 * Résultats calculés d'un plan mensuel
 */
export interface CalculatedResults {
  totalIncome: number;
  totalExpenses: number;
  availableAmount: number;
  totalEnvelopes: number;
  finalBalance: number;
  lastCalculated: string;
}

/**
 * Type pour un plan mensuel complet
 */
export interface MonthlyPlan {
  id: string;
  month: string; // Format: YYYY-MM
  fixedIncomes: FixedItem[];
  fixedExpenses: FixedItem[];
  envelopes: Envelope[];
  calculatedResults: CalculatedResults;
  createdAt: string;
  updatedAt: string;
  isTutorial?: boolean; // Indique si c'est un plan d'exemple pour le tutoriel
}

/**
 * Paramètres globaux de l'utilisateur
 */
export interface UserSettings {
  firstDayOfMonth: number; // 1-28
  currency: string; // EUR, USD, etc.
  locale: string; // fr-FR, en-US, etc.
  autoAdjustPercentages: boolean; // Ajuster auto à 100% ou erreur
  theme: 'light' | 'dark' | 'system'; // Thème de l'application
  hasSeenTutorial: boolean; // L'utilisateur a-t-il déjà vu le tutoriel ?
  tutorialCompleted: boolean; // L'utilisateur a-t-il complété le tutoriel ?
}

/**
 * État de synchronisation avec le cloud
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}

/**
 * État de migration des données locales vers le cloud
 */
export interface DataMigrationStatus {
  hasBeenProposed: boolean; // La migration a-t-elle été proposée à l'utilisateur ?
  hasBeenCompleted: boolean; // La migration a-t-elle été effectuée ?
  wasDeclined: boolean; // L'utilisateur a-t-il refusé la migration ?
  lastProposedAt: Date | null; // Date de la dernière proposition
  migratedPlansCount: number; // Nombre de plans migrés
}

/**
 * État global de l'application
 */
interface AppState {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];

  // Catégories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];

  // Plans mensuels
  monthlyPlans: MonthlyPlan[];
  currentMonthId: string | null;
  addMonthlyPlan: (month: string) => string;
  updateMonthlyPlan: (id: string, plan: Partial<MonthlyPlan>) => void;
  deleteMonthlyPlan: (id: string) => void;
  getMonthlyPlan: (id: string) => MonthlyPlan | undefined;
  copyMonthlyPlan: (sourceId: string, newMonth: string) => string;
  setCurrentMonth: (id: string | null) => void;
  recalculatePlan: (id: string) => void;
  normalizeEnvelopesForPlan: (id: string) => void;
  importMonthlyPlanFromData: (planData: Partial<MonthlyPlan>) => string;

  // Paramètres utilisateur
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;

  // Authentification et utilisateur
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;

  // Synchronisation cloud
  syncStatus: SyncStatus;
  planSyncStatus: Record<string, PlanSyncInfo>; // Statut de sync par plan
  syncWithCloud: () => Promise<void>;
  syncSinglePlan: (planId: string) => Promise<void>;
  downloadPlansFromCloud: () => Promise<void>;
  setSyncStatus: (status: Partial<SyncStatus>) => void;

  // Nouvelles actions de sync granulaire
  getCloudPlansMetadata: () => Promise<{ success: boolean; plans?: CloudPlanMetadata[]; error?: string }>;
  uploadSelectedPlansToCloud: (planIds: string[]) => Promise<{ success: boolean; uploaded?: number; errors?: string[] }>;
  downloadSelectedPlansFromCloud: (planIds: string[]) => Promise<{ success: boolean; downloaded?: number; errors?: string[] }>;
  deleteSelectedPlansFromCloud: (planIds: string[]) => Promise<{ success: boolean; deleted?: number; errors?: string[] }>;
  updatePlanSyncStatus: (planId: string, status: Partial<PlanSyncInfo>) => void;
  refreshPlansSyncStatus: () => Promise<void>;

  // Migration des données locales
  dataMigrationStatus: DataMigrationStatus;
  setDataMigrationStatus: (status: Partial<DataMigrationStatus>) => void;
  importLocalDataToCloud: () => Promise<{ success: boolean; migratedCount?: number; error?: string }>;

  // Budget
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;

  // Utilitaires
  clearAllData: () => void;
}

/**
 * Catégories par défaut
 */
const defaultCategories: Category[] = [
  { id: '1', name: 'Salaire', type: 'income', color: '#10b981' },
  { id: '2', name: 'Freelance', type: 'income', color: '#3b82f6' },
  { id: '3', name: 'Alimentation', type: 'expense', color: '#ef4444' },
  { id: '4', name: 'Transport', type: 'expense', color: '#f59e0b' },
  { id: '5', name: 'Logement', type: 'expense', color: '#8b5cf6' },
  { id: '6', name: 'Loisirs', type: 'expense', color: '#ec4899' },
];

/**
 * Paramètres utilisateur par défaut
 */
const defaultUserSettings: UserSettings = {
  firstDayOfMonth: 1,
  currency: 'EUR',
  locale: 'fr-FR',
  autoAdjustPercentages: true,
  theme: 'system',
  hasSeenTutorial: false,
  tutorialCompleted: false,
};

/**
 * Configuration du stockage avec localforage
 * Utilise localStorage comme fallback côté serveur
 */
const customStorage = {
  getItem: async (name: string) => {
    // Côté serveur, retourner null
    if (typeof window === 'undefined') return null;

    try {
      const value = await localforage.getItem<string>(name);
      return value || null;
    } catch (error) {
      console.error('Erreur lors de la récupération depuis localforage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    // Côté serveur, ne rien faire
    if (typeof window === 'undefined') return;

    try {
      await localforage.setItem(name, value);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localforage:', error);
    }
  },
  removeItem: async (name: string) => {
    // Côté serveur, ne rien faire
    if (typeof window === 'undefined') return;

    try {
      await localforage.removeItem(name);
    } catch (error) {
      console.error('Erreur lors de la suppression depuis localforage:', error);
    }
  },
};

/**
 * Store principal avec persistance
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      transactions: [],
      categories: defaultCategories,
      monthlyBudget: 0,
      monthlyPlans: [],
      currentMonthId: null,
      userSettings: defaultUserSettings,
      user: null,
      syncStatus: {
        isSyncing: false,
        lastSyncAt: null,
        error: null,
      },
      planSyncStatus: {},
      dataMigrationStatus: {
        hasBeenProposed: false,
        hasBeenCompleted: false,
        wasDeclined: false,
        lastProposedAt: null,
        migratedPlansCount: 0,
      },

      // Actions pour les transactions
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      // Actions pour les catégories
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type);
      },

      // Actions pour les plans mensuels
      addMonthlyPlan: (month: string) => {
        const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const emptyResults: CalculatedResults = {
          totalIncome: 0,
          totalExpenses: 0,
          availableAmount: 0,
          totalEnvelopes: 0,
          finalBalance: 0,
          lastCalculated: new Date().toISOString(),
        };

        const newPlan: MonthlyPlan = {
          id: planId,
          month,
          fixedIncomes: [],
          fixedExpenses: [],
          envelopes: [],
          calculatedResults: emptyResults,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          monthlyPlans: [...state.monthlyPlans, newPlan],
          currentMonthId: newPlan.id,
        }));

        // Upload vers le cloud si utilisateur connecté
        const user = get().user;
        if (user) {
          import('@/lib/supabase/sync').then(({ uploadPlanToCloud }) => {
            uploadPlanToCloud(newPlan, user.id).catch((error) => {
              console.error('Erreur lors de l\'upload du nouveau plan:', error);
            });
          });
        }

        return newPlan.id;
      },

      updateMonthlyPlan: (id: string, plan: Partial<MonthlyPlan>) => {
        set((state) => ({
          monthlyPlans: state.monthlyPlans.map((p) =>
            p.id === id
              ? { ...p, ...plan, updatedAt: new Date().toISOString() }
              : p
          ),
        }));

        // Auto-sync avec debounce si utilisateur connecté
        const user = get().user;
        if (user) {
          import('@/lib/supabase/sync').then(({ debouncedSync }) => {
            debouncedSync(() => {
              get().syncSinglePlan(id);
            });
          });
        }
      },

      deleteMonthlyPlan: (id: string) => {
        set((state) => ({
          monthlyPlans: state.monthlyPlans.filter((p) => p.id !== id),
          currentMonthId: state.currentMonthId === id ? null : state.currentMonthId,
        }));

        // Supprimer du cloud si utilisateur connecté
        const user = get().user;
        if (user) {
          import('@/lib/supabase/sync').then(({ deletePlanFromCloud }) => {
            deletePlanFromCloud(id, user.id).catch((error) => {
              console.error('Erreur lors de la suppression du plan dans le cloud:', error);
            });
          });
        }
      },

      getMonthlyPlan: (id: string) => {
        return get().monthlyPlans.find((p) => p.id === id);
      },

      copyMonthlyPlan: (sourceId: string, newMonth: string) => {
        const sourcePlan = get().monthlyPlans.find((p) => p.id === sourceId);
        if (!sourcePlan) return '';

        const newPlan: MonthlyPlan = {
          ...sourcePlan,
          id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          month: newMonth,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          monthlyPlans: [...state.monthlyPlans, newPlan],
          currentMonthId: newPlan.id,
        }));

        return newPlan.id;
      },

      setCurrentMonth: (id: string | null) => {
        set({ currentMonthId: id });
      },

      // Actions de calcul
      recalculatePlan: (id: string) => {
        const plan = get().monthlyPlans.find((p) => p.id === id);
        if (!plan) return;

        // Import dynamique pour éviter les dépendances circulaires
        import('@/lib/plan-calculator').then(({ calculatePlanResults }) => {
          const calculatedResults = calculatePlanResults(plan);

          set((state) => ({
            monthlyPlans: state.monthlyPlans.map((p) =>
              p.id === id
                ? {
                    ...p,
                    calculatedResults,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
        });
      },

      normalizeEnvelopesForPlan: (id: string) => {
        const plan = get().monthlyPlans.find((p) => p.id === id);
        if (!plan) return;

        const settings = get().userSettings;
        if (!settings.autoAdjustPercentages) {
          console.warn('Auto-ajustement des pourcentages désactivé');
          return;
        }

        import('@/lib/monthly-plan').then(({ normalizeEnvelopePercentages, recalculateEnvelopeAmounts, calculateAvailableAmount }) => {
          const normalizedEnvelopes = normalizeEnvelopePercentages(plan.envelopes);
          const availableAmount = calculateAvailableAmount(plan.fixedIncomes, plan.fixedExpenses);
          const updatedEnvelopes = recalculateEnvelopeAmounts(normalizedEnvelopes, availableAmount);

          set((state) => ({
            monthlyPlans: state.monthlyPlans.map((p) =>
              p.id === id
                ? {
                    ...p,
                    envelopes: updatedEnvelopes,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));

          // Recalculer les résultats après normalisation
          get().recalculatePlan(id);
        });
      },

      importMonthlyPlanFromData: (planData: Partial<MonthlyPlan>) => {
        const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date().toISOString();

        // Générer de nouveaux IDs pour tous les items pour éviter les conflits
        const fixedIncomes = (planData.fixedIncomes || []).map((item) => ({
          ...item,
          id: `income-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }));

        const fixedExpenses = (planData.fixedExpenses || []).map((item) => ({
          ...item,
          id: `expense-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }));

        const envelopes = (planData.envelopes || []).map((item) => ({
          ...item,
          id: `env-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }));

        const emptyResults: CalculatedResults = {
          totalIncome: 0,
          totalExpenses: 0,
          availableAmount: 0,
          totalEnvelopes: 0,
          finalBalance: 0,
          lastCalculated: now,
        };

        const newPlan: MonthlyPlan = {
          id: planId,
          month: planData.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          fixedIncomes,
          fixedExpenses,
          envelopes,
          calculatedResults: planData.calculatedResults || emptyResults,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          monthlyPlans: [...state.monthlyPlans, newPlan],
          currentMonthId: newPlan.id,
        }));

        // Recalculer les résultats après import
        get().recalculatePlan(planId);

        return planId;
      },

      // Paramètres utilisateur
      updateUserSettings: (settings: Partial<UserSettings>) => {
        set((state) => ({
          userSettings: { ...state.userSettings, ...settings },
        }));
      },

      // Actions d'authentification
      setUser: (user: User | null) => {
        set({ user });
      },

      logout: async () => {
        try {
          const { signOut } = await import('@/lib/supabase/auth');
          const result = await signOut();

          if (result.success) {
            set({ user: null });
          } else {
            console.error('Erreur lors de la déconnexion:', result.error);
          }
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
      },

      initializeAuth: async () => {
        try {
          const { getCurrentUser, onAuthStateChange } = await import('@/lib/supabase/auth');

          // Récupérer l'utilisateur actuel
          const user = await getCurrentUser();
          set({ user });

          // Écouter les changements d'authentification
          onAuthStateChange((user) => {
            set({ user });
          });

          // Si un utilisateur est connecté, télécharger ses plans depuis le cloud
          if (user) {
            get().downloadPlansFromCloud();
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        }
      },

      // Actions de synchronisation
      setSyncStatus: (status: Partial<SyncStatus>) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        }));
      },

      syncWithCloud: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
          console.warn('Impossible de synchroniser : utilisateur non connecté');
          return;
        }

        // Marquer comme en cours de synchronisation
        state.setSyncStatus({ isSyncing: true, error: null });

        try {
          const { syncAllPlans } = await import('@/lib/supabase/sync');

          const result = await syncAllPlans(state.monthlyPlans, user.id);

          if (result.success && result.plans) {
            // Mettre à jour les plans avec les versions synchronisées
            set({
              monthlyPlans: result.plans,
              syncStatus: {
                isSyncing: false,
                lastSyncAt: new Date(),
                error: null,
              },
            });

            console.log(`Synchronisation réussie : ${result.synced} plans synchronisés, ${result.conflicts} conflits résolus`);
          } else {
            state.setSyncStatus({
              isSyncing: false,
              error: result.error || 'Erreur inconnue',
            });
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation:', error);
          state.setSyncStatus({
            isSyncing: false,
            error: 'Erreur lors de la synchronisation',
          });
        }
      },

      syncSinglePlan: async (planId: string) => {
        const state = get();
        const user = state.user;

        if (!user) {
          console.warn('Impossible de synchroniser : utilisateur non connecté');
          return;
        }

        const plan = state.monthlyPlans.find((p) => p.id === planId);
        if (!plan) {
          console.error(`Plan ${planId} introuvable`);
          return;
        }

        try {
          const { syncPlan } = await import('@/lib/supabase/sync');

          const result = await syncPlan(plan, user.id);

          if (result.success && result.plan) {
            // Mettre à jour le plan avec la version synchronisée
            set((state) => ({
              monthlyPlans: state.monthlyPlans.map((p) =>
                p.id === planId ? result.plan! : p
              ),
            }));

            if (result.conflict) {
              console.log(`Conflit résolu pour le plan ${planId}`);
            }
          } else {
            console.error(`Erreur lors de la sync du plan ${planId}:`, result.error);
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation du plan:', error);
        }
      },

      downloadPlansFromCloud: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
          console.warn('Impossible de télécharger : utilisateur non connecté');
          return;
        }

        state.setSyncStatus({ isSyncing: true, error: null });

        try {
          const { downloadPlansFromCloud } = await import('@/lib/supabase/sync');

          const result = await downloadPlansFromCloud(user.id);

          if (result.success && result.plans) {
            // Fusionner les plans cloud avec les plans locaux
            const localPlanIds = new Set(state.monthlyPlans.map((p) => p.id));
            const cloudOnlyPlans = result.plans.filter((p) => !localPlanIds.has(p.id));

            set((state) => ({
              monthlyPlans: [...state.monthlyPlans, ...cloudOnlyPlans],
              syncStatus: {
                isSyncing: false,
                lastSyncAt: new Date(),
                error: null,
              },
            }));

            console.log(`Téléchargement réussi : ${cloudOnlyPlans.length} nouveaux plans`);
          } else {
            state.setSyncStatus({
              isSyncing: false,
              error: result.error || 'Erreur inconnue',
            });
          }
        } catch (error) {
          console.error('Erreur lors du téléchargement:', error);
          state.setSyncStatus({
            isSyncing: false,
            error: 'Erreur lors du téléchargement',
          });
        }
      },

      // Actions de migration
      setDataMigrationStatus: (status: Partial<DataMigrationStatus>) => {
        set((state) => ({
          dataMigrationStatus: { ...state.dataMigrationStatus, ...status },
        }));
      },

      importLocalDataToCloud: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
          console.warn('Impossible de migrer : utilisateur non connecté');
          return {
            success: false,
            error: 'Utilisateur non connecté',
          };
        }

        const localPlans = state.monthlyPlans;
        if (localPlans.length === 0) {
          console.log('Aucun plan local à migrer');
          return {
            success: true,
            migratedCount: 0,
          };
        }

        try {
          const { uploadPlanToCloud } = await import('@/lib/supabase/sync');

          let migratedCount = 0;
          const errors: string[] = [];

          // Upload chaque plan local vers le cloud
          for (const plan of localPlans) {
            try {
              const result = await uploadPlanToCloud(plan, user.id);
              if (result.success) {
                migratedCount++;
              } else {
                errors.push(`Plan ${plan.month}: ${result.error}`);
              }
            } catch (error) {
              console.error(`Erreur lors de l'upload du plan ${plan.id}:`, error);
              errors.push(`Plan ${plan.month}: erreur inattendue`);
            }
          }

          // Mettre à jour le statut de migration
          state.setDataMigrationStatus({
            hasBeenCompleted: true,
            migratedPlansCount: migratedCount,
          });

          if (errors.length > 0) {
            console.warn('Erreurs lors de la migration:', errors);
            return {
              success: migratedCount > 0,
              migratedCount,
              error: `${migratedCount}/${localPlans.length} plans migrés. Erreurs: ${errors.join(', ')}`,
            };
          }

          console.log(`Migration réussie : ${migratedCount} plans migrés`);
          return {
            success: true,
            migratedCount,
          };
        } catch (error) {
          console.error('Erreur inattendue lors de la migration:', error);
          return {
            success: false,
            error: 'Erreur inattendue lors de la migration',
          };
        }
      },

      // Nouvelles actions de synchronisation granulaire
      getCloudPlansMetadata: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
          return {
            success: false,
            error: 'Utilisateur non connecté',
          };
        }

        try {
          const { getCloudPlansMetadata } = await import('@/lib/supabase/sync');
          return await getCloudPlansMetadata(user.id);
        } catch (error) {
          console.error('Erreur lors de la récupération des métadonnées cloud:', error);
          return {
            success: false,
            error: 'Erreur inattendue',
          };
        }
      },

      uploadSelectedPlansToCloud: async (planIds: string[]) => {
        const state = get();
        const user = state.user;

        if (!user) {
          return {
            success: false,
            errors: ['Utilisateur non connecté'],
          };
        }

        const plansToUpload = state.monthlyPlans.filter((p) => planIds.includes(p.id));

        if (plansToUpload.length === 0) {
          return {
            success: false,
            errors: ['Aucun plan à uploader'],
          };
        }

        try {
          const { uploadSelectedPlans } = await import('@/lib/supabase/sync');

          // Marquer les plans comme en cours de sync
          planIds.forEach((planId) => {
            state.updatePlanSyncStatus(planId, { status: 'syncing' });
          });

          const result = await uploadSelectedPlans(plansToUpload, user.id);

          // Rafraîchir le statut de sync
          await state.refreshPlansSyncStatus();

          return result;
        } catch (error) {
          console.error('Erreur lors de l\'upload des plans:', error);
          return {
            success: false,
            errors: ['Erreur inattendue'],
          };
        }
      },

      downloadSelectedPlansFromCloud: async (planIds: string[]) => {
        const state = get();
        const user = state.user;

        if (!user) {
          return {
            success: false,
            errors: ['Utilisateur non connecté'],
          };
        }

        try {
          const { downloadSelectedPlans } = await import('@/lib/supabase/sync');

          const result = await downloadSelectedPlans(planIds, user.id);

          if (result.success && result.plans) {
            // Ajouter les plans téléchargés au store
            const existingPlanIds = new Set(state.monthlyPlans.map((p) => p.id));
            const newPlans = result.plans.filter((p) => !existingPlanIds.has(p.id));

            if (newPlans.length > 0) {
              set((state) => ({
                monthlyPlans: [...state.monthlyPlans, ...newPlans],
              }));

              // Recalculer les plans téléchargés
              newPlans.forEach((plan) => {
                state.recalculatePlan(plan.id);
              });
            }

            // Rafraîchir le statut de sync
            await state.refreshPlansSyncStatus();
          }

          return result;
        } catch (error) {
          console.error('Erreur lors du téléchargement des plans:', error);
          return {
            success: false,
            errors: ['Erreur inattendue'],
          };
        }
      },

      deleteSelectedPlansFromCloud: async (planIds: string[]) => {
        const state = get();
        const user = state.user;

        if (!user) {
          return {
            success: false,
            errors: ['Utilisateur non connecté'],
          };
        }

        try {
          const { deleteSelectedPlansFromCloud } = await import('@/lib/supabase/sync');

          const result = await deleteSelectedPlansFromCloud(planIds, user.id);

          if (result.success) {
            // Rafraîchir le statut de sync
            await state.refreshPlansSyncStatus();
          }

          return result;
        } catch (error) {
          console.error('Erreur lors de la suppression des plans:', error);
          return {
            success: false,
            errors: ['Erreur inattendue'],
          };
        }
      },

      updatePlanSyncStatus: (planId: string, status: Partial<PlanSyncInfo>) => {
        set((state) => ({
          planSyncStatus: {
            ...state.planSyncStatus,
            [planId]: {
              ...state.planSyncStatus[planId],
              planId,
              ...status,
            } as PlanSyncInfo,
          },
        }));
      },

      refreshPlansSyncStatus: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
          console.warn('Impossible de rafraîchir : utilisateur non connecté');
          return;
        }

        try {
          const { getCloudPlansMetadata, comparePlanStatus } = await import('@/lib/supabase/sync');

          const result = await getCloudPlansMetadata(user.id);

          if (result.success && result.plans) {
            const cloudPlansMap = new Map(
              result.plans.map((p) => [p.planId, p])
            );

            const newSyncStatus: Record<string, PlanSyncInfo> = {};

            // Vérifier chaque plan local
            state.monthlyPlans.forEach((localPlan) => {
              const cloudMetadata = cloudPlansMap.get(localPlan.id);
              const status = comparePlanStatus(localPlan, cloudMetadata || null);

              newSyncStatus[localPlan.id] = {
                planId: localPlan.id,
                status,
                localUpdatedAt: new Date(localPlan.updatedAt),
                cloudUpdatedAt: cloudMetadata ? new Date(cloudMetadata.updatedAt) : undefined,
              };

              // Retirer du map pour identifier les plans cloud-only
              if (cloudMetadata) {
                cloudPlansMap.delete(localPlan.id);
              }
            });

            // Ajouter les plans cloud-only
            cloudPlansMap.forEach((cloudPlan) => {
              newSyncStatus[cloudPlan.planId] = {
                planId: cloudPlan.planId,
                status: 'cloud_only',
                cloudUpdatedAt: new Date(cloudPlan.updatedAt),
              };
            });

            set({ planSyncStatus: newSyncStatus });
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du statut de sync:', error);
        }
      },

      // Actions pour le budget
      setMonthlyBudget: (budget) => {
        set({ monthlyBudget: budget });
      },

      // Utilitaires
      clearAllData: () => {
        set({
          transactions: [],
          categories: defaultCategories,
          monthlyBudget: 0,
          monthlyPlans: [],
          currentMonthId: null,
          userSettings: defaultUserSettings,
          user: null,
        });
      },
    }),
    {
      name: 'moneto-storage',
      storage: createJSONStorage(() => customStorage),
      version: 2, // Version du store pour migration future
      onRehydrateStorage: () => (state) => {
        // Callback appelé après la restauration depuis le stockage
        if (!state) return;

        // Recalculer tous les plans après restauration
        state.monthlyPlans.forEach((plan) => {
          // Vérifier si le plan a besoin d'être migré (ancien format sans calculatedResults)
          if (!plan.calculatedResults) {
            const emptyResults: CalculatedResults = {
              totalIncome: 0,
              totalExpenses: 0,
              availableAmount: 0,
              totalEnvelopes: 0,
              finalBalance: 0,
              lastCalculated: new Date().toISOString(),
            };
            plan.calculatedResults = emptyResults;
          }

          // Migration : Ajouter le type 'percentage' aux enveloppes existantes sans type
          plan.envelopes = plan.envelopes.map((env): Envelope => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyEnv = env as any;
            if (!('type' in anyEnv)) {
              return {
                id: anyEnv.id,
                name: anyEnv.name,
                type: 'percentage' as const,
                percentage: anyEnv.percentage,
                amount: anyEnv.amount,
              };
            }
            return env;
          });

          // Recalculer immédiatement les résultats
          state.recalculatePlan(plan.id);
        });

        console.log('Store Moneto réhydraté avec succès');
      },
    }
  )
);
