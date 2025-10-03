import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

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
      },

      deleteMonthlyPlan: (id: string) => {
        set((state) => ({
          monthlyPlans: state.monthlyPlans.filter((p) => p.id !== id),
          currentMonthId: state.currentMonthId === id ? null : state.currentMonthId,
        }));
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
