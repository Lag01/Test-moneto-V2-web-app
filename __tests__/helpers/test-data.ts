import type { MonthlyPlan, CalculatedResults, Envelope, FixedItem } from '@/store';

/**
 * Crée un plan mensuel de test
 */
export const createMockMonthlyPlan = (overrides?: Partial<MonthlyPlan>): MonthlyPlan => {
  const now = new Date().toISOString();

  const defaultResults: CalculatedResults = {
    totalIncome: 3000,
    totalExpenses: 1500,
    availableAmount: 1500,
    totalEnvelopes: 1500,
    finalBalance: 0,
    lastCalculated: now,
  };

  const defaultIncomes: FixedItem[] = [
    { id: 'income-1', name: 'Salaire', amount: 3000 },
  ];

  const defaultExpenses: FixedItem[] = [
    { id: 'expense-1', name: 'Loyer', amount: 1000 },
    { id: 'expense-2', name: 'Assurances', amount: 500 },
  ];

  const defaultEnvelopes: Envelope[] = [
    { id: 'env-1', name: 'Alimentation', type: 'percentage', percentage: 50, amount: 750 },
    { id: 'env-2', name: 'Loisirs', type: 'percentage', percentage: 30, amount: 450 },
    { id: 'env-3', name: 'Épargne', type: 'percentage', percentage: 20, amount: 300 },
  ];

  return {
    id: 'plan-test-1',
    month: '2025-01',
    fixedIncomes: defaultIncomes,
    fixedExpenses: defaultExpenses,
    envelopes: defaultEnvelopes,
    calculatedResults: defaultResults,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Crée plusieurs plans mensuels de test
 */
export const createMockMonthlyPlans = (count: number): MonthlyPlan[] => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return createMockMonthlyPlan({
      id: `plan-test-${i + 1}`,
      month,
    });
  });
};

/**
 * Crée un plan avec un timestamp spécifique (pour tester les conflits)
 */
export const createMockPlanWithTimestamp = (
  id: string,
  updatedAt: string,
  overrides?: Partial<MonthlyPlan>
): MonthlyPlan => {
  return createMockMonthlyPlan({
    id,
    updatedAt,
    ...overrides,
  });
};

/**
 * Crée une row de base de données (format Supabase)
 */
export const createMockPlanRow = (plan: MonthlyPlan, userId: string) => ({
  id: `db-${plan.id}`,
  user_id: userId,
  plan_id: plan.id,
  name: `Plan ${plan.month}`,
  data: {
    month: plan.month,
    fixedIncomes: plan.fixedIncomes,
    fixedExpenses: plan.fixedExpenses,
    envelopes: plan.envelopes,
  },
  created_at: plan.createdAt,
  updated_at: plan.updatedAt,
});
