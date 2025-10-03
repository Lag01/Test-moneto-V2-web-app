# Guide du Store Zustand Amélioré - Moneto

## Vue d'ensemble

Le store Zustand a été amélioré pour gérer automatiquement les calculs budgétaires et la validation des pourcentages. Toutes les données sont persistées localement via **localforage** (IndexedDB).

## Nouvelles fonctionnalités

### 1. Paramètres utilisateur globaux

```typescript
interface UserSettings {
  firstDayOfMonth: number;      // 1-28, premier jour du cycle budgétaire
  currency: string;              // EUR, USD, etc.
  locale: string;                // fr-FR, en-US, etc.
  autoAdjustPercentages: boolean; // Ajuster auto à 100% ou erreur
}
```

**Utilisation :**
```typescript
const { userSettings, updateUserSettings } = useAppStore();

// Modifier les paramètres
updateUserSettings({
  firstDayOfMonth: 15, // Budget commence le 15 du mois
  autoAdjustPercentages: false, // Mode strict
});
```

### 2. Résultats calculés automatiques

Chaque `MonthlyPlan` contient maintenant un objet `calculatedResults` :

```typescript
interface CalculatedResults {
  totalIncome: number;        // Total des revenus fixes
  totalExpenses: number;      // Total des dépenses fixes
  availableAmount: number;    // Reste = Revenus - Dépenses
  totalEnvelopes: number;     // Total alloué dans les enveloppes
  finalBalance: number;       // Solde final après allocations
  lastCalculated: string;     // Date du dernier calcul
}
```

**Ces résultats sont calculés automatiquement :**
- À la création d'un plan
- À la modification des revenus/dépenses
- À la modification des enveloppes
- À la restauration depuis le stockage

### 3. Logique de calcul du budget

Le système suit cette logique stricte :

```
1. Total Revenus = Σ(revenus fixes)
2. Total Dépenses = Σ(dépenses fixes)
3. Reste Disponible = Total Revenus - Total Dépenses
4. Pour chaque enveloppe :
   montant = (Reste Disponible × pourcentage) / 100
5. Total Enveloppes = Σ(montants enveloppes)
6. Solde Final = Reste Disponible - Total Enveloppes
```

### 4. Validation et normalisation des pourcentages

#### Mode automatique (par défaut)
Si `autoAdjustPercentages = true`, les pourcentages sont automatiquement ajustés à 100% :

```typescript
const { normalizeEnvelopesForPlan } = useAppStore();

// Ajuste automatiquement les pourcentages proportionnellement
normalizeEnvelopesForPlan(planId);
```

**Exemple :**
```
Avant : [40%, 30%, 20%] = 90%
Après : [44.44%, 33.33%, 22.22%] = 100%
```

#### Mode strict
Si `autoAdjustPercentages = false`, une erreur est levée si total ≠ 100%.

### 5. Recalcul manuel

Forcer le recalcul complet d'un plan :

```typescript
const { recalculatePlan } = useAppStore();

// Recalcule tous les résultats du plan
recalculatePlan(planId);
```

## Utilisation dans les composants

### Accéder aux résultats calculés

```typescript
const { monthlyPlans, currentMonthId } = useAppStore();
const currentPlan = monthlyPlans.find(p => p.id === currentMonthId);

// Utiliser les résultats pré-calculés
const { totalIncome, availableAmount, finalBalance } = currentPlan.calculatedResults;
```

### Modifier un plan et déclencher le recalcul

```typescript
const { updateMonthlyPlan, recalculatePlan } = useAppStore();

// 1. Modifier le plan
updateMonthlyPlan(planId, {
  fixedIncomes: [...newIncomes],
});

// 2. Recalculer (optionnel car fait automatiquement)
recalculatePlan(planId);
```

### Valider les pourcentages

```typescript
import { validateEnvelopesPercentage, getTotalPercentage } from '@/lib/monthly-plan';

const plan = monthlyPlans.find(p => p.id === planId);

// Vérifier si = 100%
const isValid = validateEnvelopesPercentage(plan.envelopes);

// Obtenir le total actuel
const total = getTotalPercentage(plan.envelopes);
console.log(`Total: ${total}%`); // Ex: 97.5%
```

## Persistance et restauration

### Stockage automatique
Toutes les modifications sont **automatiquement sauvegardées** dans IndexedDB via localforage.

### Restauration au démarrage
Lors du chargement de l'application :

1. Les données sont restaurées depuis localforage
2. Un callback `onRehydrateStorage` est déclenché
3. Tous les plans sont **recalculés automatiquement**
4. Les plans anciens (sans `calculatedResults`) sont migrés

### Migration de version
Le store a un système de versioning pour gérer les migrations futures :

```typescript
{
  version: 2, // Version actuelle
  onRehydrateStorage: () => (state) => {
    // Migration automatique des anciens plans
    state.monthlyPlans.forEach(plan => {
      if (!plan.calculatedResults) {
        // Ajouter calculatedResults manquant
        plan.calculatedResults = emptyResults;
      }
      // Recalculer
      state.recalculatePlan(plan.id);
    });
  }
}
```

## Exemples d'utilisation

### Créer un plan complet

```typescript
const { addMonthlyPlan, updateMonthlyPlan } = useAppStore();

// 1. Créer le plan
const planId = addMonthlyPlan('2025-04');

// 2. Ajouter revenus
updateMonthlyPlan(planId, {
  fixedIncomes: [
    { id: '1', name: 'Salaire', amount: 3000 },
    { id: '2', name: 'Freelance', amount: 500 },
  ],
});

// 3. Ajouter dépenses
updateMonthlyPlan(planId, {
  fixedExpenses: [
    { id: '1', name: 'Loyer', amount: 1000 },
    { id: '2', name: 'Assurance', amount: 200 },
  ],
});

// 4. Ajouter enveloppes (total doit = 100%)
updateMonthlyPlan(planId, {
  envelopes: [
    { id: '1', name: 'Épargne', percentage: 40, amount: 0 },
    { id: '2', name: 'Loisirs', percentage: 30, amount: 0 },
    { id: '3', name: 'Crypto', percentage: 30, amount: 0 },
  ],
});

// Les montants sont calculés automatiquement :
// Reste = 3500 - 1200 = 2300€
// Épargne = 2300 × 40% = 920€
// Loisirs = 2300 × 30% = 690€
// Crypto = 2300 × 30% = 690€
```

### Ajuster automatiquement les pourcentages

```typescript
const { normalizeEnvelopesForPlan, userSettings } = useAppStore();

// S'assurer que l'auto-ajustement est activé
if (userSettings.autoAdjustPercentages) {
  normalizeEnvelopesForPlan(planId);
}
```

## Fonctions utilitaires disponibles

### Dans `lib/monthly-plan.ts`

- `calculateFixedTotal(items)` - Total des éléments fixes
- `calculateAvailableAmount(incomes, expenses)` - Calcul du reste
- `normalizeEnvelopePercentages(envelopes)` - Normalise à 100%
- `recalculateEnvelopeAmounts(envelopes, available)` - Recalcule les montants
- `validateEnvelopesPercentage(envelopes)` - Valide = 100%
- `getTotalPercentage(envelopes)` - Obtient le total
- `getPlanSummary(plan)` - Résumé complet du plan

### Dans `lib/plan-calculator.ts`

- `calculatePlanResults(plan)` - Calcule tous les résultats
- `createCalculatedPlan(month, id)` - Crée un plan vide avec résultats

## Bonnes pratiques

1. **Toujours vérifier les pourcentages** avant de sauvegarder
2. **Utiliser `recalculatePlan`** après des modifications importantes
3. **Activer `autoAdjustPercentages`** pour une meilleure UX
4. **Consulter `calculatedResults`** plutôt que recalculer manuellement
5. **Ne pas modifier `calculatedResults` directement** (lecture seule)

## Gestion des erreurs

```typescript
import { validateMonthlyPlan } from '@/lib/monthly-plan';

const plan = monthlyPlans.find(p => p.id === planId);
const validation = validateMonthlyPlan(plan);

if (!validation.valid) {
  console.error('Erreurs de validation:', validation.errors);
  // ["La somme des pourcentages doit être égale à 100%"]
}
```

## État du store

```typescript
{
  // Données existantes
  transactions: Transaction[],
  categories: Category[],
  monthlyBudget: number,

  // Plans mensuels avec calculs
  monthlyPlans: MonthlyPlan[],  // Contient calculatedResults
  currentMonthId: string | null,

  // NOUVEAU : Paramètres utilisateur
  userSettings: {
    firstDayOfMonth: 1,
    currency: 'EUR',
    locale: 'fr-FR',
    autoAdjustPercentages: true,
  },
}
```

## Résumé

Le store Zustand de Moneto gère maintenant **automatiquement** :
- ✅ Calcul des totaux (revenus, dépenses)
- ✅ Calcul du reste disponible
- ✅ Calcul des montants des enveloppes selon les pourcentages
- ✅ Validation et normalisation des pourcentages (ajustement à 100%)
- ✅ Persistance dans IndexedDB via localforage
- ✅ Restauration et recalcul au chargement
- ✅ Migration automatique des anciens plans
- ✅ Paramètres utilisateur globaux

Plus besoin de calculer manuellement dans les composants !
