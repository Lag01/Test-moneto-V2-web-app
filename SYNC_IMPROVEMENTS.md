# 🔄 Améliorations du système de synchronisation Moneto

## 📅 Date : Octobre 2025

---

## 🎯 Problèmes résolus

### 1. ❌ Faux positifs de détection de modifications

**Problème identifié :**
- Le champ `updatedAt` était mis à jour **à chaque interaction** avec un plan (lecture, recalcul, normalisation)
- Cela créait de faux conflits de synchronisation même quand le contenu n'avait pas vraiment changé
- L'utilisateur voyait constamment des plans marqués comme "Local plus récent" ou "Cloud plus récent" alors qu'ils étaient identiques

**Localisation du bug :**
- `store/index.ts:378` - `updateMonthlyPlan()` mettait toujours à jour `updatedAt`
- `store/index.ts:454` - `recalculatePlan()` mettait à jour `updatedAt` même pour un simple recalcul
- `store/index.ts:483` - `normalizeEnvelopesForPlan()` mettait à jour `updatedAt` lors de la normalisation auto

---

## ✅ Solutions implémentées

### Phase 1 : Système de détection par hash de contenu

#### 1.1 Fonction `generatePlanHash()` (lib/supabase/sync.ts:14)
```typescript
export function generatePlanHash(plan: MonthlyPlan): string {
  // Extrait uniquement les données métier (ce qui compte pour l'utilisateur)
  const relevantData = {
    month: plan.month,
    fixedIncomes: plan.fixedIncomes.map((item) => ({
      name: item.name,
      amount: item.amount,
    })),
    fixedExpenses: plan.fixedExpenses.map((item) => ({
      name: item.name,
      amount: item.amount,
    })),
    envelopes: plan.envelopes.map((env) => ({
      name: env.name,
      type: env.type,
      percentage: env.percentage,
      amount: env.amount,
    })),
  };

  // Générer un hash Base64 du JSON canonique
  const str = JSON.stringify(relevantData, Object.keys(relevantData).sort());
  return btoa(unescape(encodeURIComponent(str)));
}
```

**Avantages :**
- ✅ Détection précise des vraies modifications
- ✅ Ignore les changements de métadonnées (id, dates, calculatedResults)
- ✅ Pas de migration de base de données nécessaire
- ✅ Performance acceptable (hash en mémoire)

#### 1.2 Comparaison intelligente (lib/supabase/sync.ts:772)
```typescript
export function comparePlanStatus(
  localPlan: MonthlyPlan | null,
  cloudMetadata: CloudPlanMetadata | null,
  cloudPlanData?: MonthlyPlan | null
): PlanSyncStatus {
  // Si on a les données complètes, comparer les hash d'abord
  if (localPlan && cloudMetadata && cloudPlanData) {
    const localHash = generatePlanHash(localPlan);
    const cloudHash = generatePlanHash(cloudPlanData);

    // Hash identiques = contenu identique = synchronisé
    if (localHash === cloudHash) {
      return 'synced';
    }

    // Hash différents = comparer les timestamps
    const localTime = new Date(localPlan.updatedAt).getTime();
    const cloudTime = new Date(cloudMetadata.updatedAt).getTime();

    if (localTime > cloudTime) {
      return 'local_newer';
    } else if (cloudTime > localTime) {
      return 'cloud_newer';
    }
  }

  // Fallback sur comparaison timestamps uniquement
  // ...
}
```

#### 1.3 Mise à jour conditionnelle de `updatedAt` (store/index.ts:374)
```typescript
updateMonthlyPlan: (id: string, plan: Partial<MonthlyPlan>) => {
  const currentPlan = get().monthlyPlans.find((p) => p.id === id);
  if (!currentPlan) return;

  // Vérifier si le contenu a vraiment changé
  import('@/lib/supabase/sync').then(({ generatePlanHash }) => {
    const updatedPlan = { ...currentPlan, ...plan };
    const oldHash = generatePlanHash(currentPlan);
    const newHash = generatePlanHash(updatedPlan);

    // Ne mettre à jour updatedAt QUE si le contenu a changé
    const shouldUpdateTimestamp = oldHash !== newHash;

    set((state) => ({
      monthlyPlans: state.monthlyPlans.map((p) =>
        p.id === id
          ? {
              ...p,
              ...plan,
              updatedAt: shouldUpdateTimestamp
                ? new Date().toISOString()
                : p.updatedAt
            }
          : p
      ),
    }));

    // Auto-sync uniquement si vraie modification
    const user = get().user;
    if (user && shouldUpdateTimestamp) {
      // ... sync logic
    }
  });
}
```

#### 1.4 Suppression de `updatedAt` dans les opérations non-modifiantes

**`recalculatePlan()` (store/index.ts:459) :**
```typescript
// ❌ AVANT
updatedAt: new Date().toISOString()

// ✅ APRÈS
// NE PAS mettre à jour updatedAt : recalcul != modification
```

**`normalizeEnvelopesForPlan()` (store/index.ts:481) :**
```typescript
// ❌ AVANT
updatedAt: new Date().toISOString()

// ✅ APRÈS
// NE PAS mettre à jour updatedAt : normalisation auto != modification utilisateur
```

---

### Phase 2 : Refonte visuelle du tableau de synchronisation

#### 2.1 Nouveau design en colonnes (components/sync/SyncManagementModal.tsx:306)

**Vue comparative Local ↔ Statut ↔ Cloud :**

```
┌──────┬───────────────┬─────────────┬──────────┬─────────────┐
│  ☑   │  Plan         │   Local     │  Statut  │   Cloud     │
├──────┼───────────────┼─────────────┼──────────┼─────────────┤
│  ☐   │ Janvier 2025  │  📱 15:32   │  ↔ ✓    │  ☁️ 15:32   │
│  ☐   │ Février 2025  │  📱 16:45   │  ↑ ⚠    │  ☁️ 14:20   │
└──────┴───────────────┴─────────────┴──────────┴─────────────┘
```

**Nouveautés :**
- ✅ Affichage temps relatif ("Il y a 5 min" au lieu de timestamps bruts)
- ✅ Icônes de direction (↑ upload suggéré, ↓ download suggéré, ↔ synchronisé)
- ✅ Codes couleur par statut :
  - 🟢 Vert : Synchronisé
  - 🟠 Orange : Local plus récent (upload recommandé)
  - 🔵 Bleu : Cloud plus récent (download recommandé)
  - ⚪ Gris : Non synchronisé
- ✅ Vue en grille responsive (grid-cols-12)

#### 2.2 Fonction de temps relatif (components/sync/SyncManagementModal.tsx:205)
```typescript
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};
```

#### 2.3 Icônes de direction de sync (components/sync/SyncManagementModal.tsx:222)
```typescript
const getSyncActionIcon = (status: string) => {
  switch (status) {
    case 'local_newer':
      return <UploadIcon />; // Flèche vers le haut orange
    case 'cloud_newer':
      return <DownloadIcon />; // Flèche vers le bas bleue
    case 'synced':
      return <SyncedIcon />; // Flèches bidirectionnelles vertes
    default:
      return null;
  }
};
```

#### 2.4 Amélioration des badges (components/sync/PlanSyncStatusBadge.tsx:74)
```typescript
// Badge "Local plus récent" avec couleur orange distinctive
colorClass: 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700'

// + transition-all pour animations fluides
```

---

## 📊 Impact des changements

### Avant
- ❌ Faux positifs constants de détection de modifications
- ❌ Synchronisation déclenchée à chaque lecture/recalcul
- ❌ Interface peu claire avec timestamps bruts
- ❌ Difficile de comprendre quel plan doit être sync

### Après
- ✅ Détection précise basée sur le contenu réel
- ✅ Sync uniquement lors de vraies modifications utilisateur
- ✅ Interface intuitive avec temps relatif et icônes
- ✅ Action recommandée claire (upload ↑ ou download ↓)

---

## 🧪 Tests recommandés

### Test 1 : Modification réelle vs recalcul
1. Modifier un revenu/dépense dans un plan → `updatedAt` change ✅
2. Naviguer vers le plan (déclenchant recalcul) → `updatedAt` ne change PAS ✅
3. Vérifier statut sync : doit rester "Synchronisé" si aucune modif réelle ✅

### Test 2 : Détection de conflit
1. Modifier plan A en local → statut "Local plus récent" (orange) ✅
2. Simuler modification cloud → statut "Cloud plus récent" (bleu) ✅
3. Vérifier hash identiques → statut "Synchronisé" (vert) même si timestamps différents ✅

### Test 3 : Interface utilisateur
1. Ouvrir modal de sync → vue comparative claire ✅
2. Vérifier temps relatif ("Il y a X min") au lieu de timestamps ✅
3. Vérifier icônes de direction (↑ ↓ ↔) ✅
4. Vérifier codes couleur par statut ✅

---

## 📁 Fichiers modifiés

### Synchronisation (core logic)
- ✅ `lib/supabase/sync.ts` - Ajout `generatePlanHash()` et modification `comparePlanStatus()`
- ✅ `store/index.ts` - Correction `updateMonthlyPlan()`, `recalculatePlan()`, `normalizeEnvelopesForPlan()`

### Interface utilisateur
- ✅ `components/sync/SyncManagementModal.tsx` - Refonte complète du design
- ✅ `components/sync/PlanSyncStatusBadge.tsx` - Amélioration des badges avec couleurs

---

## 🚀 Prochaines étapes (optionnel)

### Phase 3 : Optimisations avancées (long terme)

#### 3.1 Système de version (plus standard)
- Ajouter colonne `version: INTEGER` dans Supabase
- Incrémenter version uniquement sur modification réelle
- Plus performant que hash (int vs string)

#### 3.2 Sync différentiel
- Ne synchroniser que les champs modifiés
- Réduire la bande passante
- Logs détaillés des changements

#### 3.3 Groupement intelligent dans l'UI
- Section "À synchroniser" en haut (orange/bleu)
- Section "Synchronisé" minimisée (vert)
- Section "Cloud uniquement" séparée

---

## 📝 Notes techniques

### Choix de conception

**Pourquoi le hash plutôt que version number ?**
- ✅ Pas de migration DB nécessaire
- ✅ Fonctionne immédiatement
- ✅ Détection robuste même avec données legacy

**Pourquoi exclure `calculatedResults` du hash ?**
- Les résultats calculés dérivent des autres champs
- Peuvent changer à cause de bugs/optimisations du code de calcul
- Ne représentent pas une modification utilisateur

**Pourquoi temps relatif dans l'UI ?**
- Plus intuitif : "Il y a 5 min" vs "2025-10-17 15:32:14"
- Réduit la charge cognitive
- Standard des apps modernes (GitHub, Slack, etc.)

---

## ✅ Validation du build

```bash
npm run build
```

**Résultat :** ✅ Build réussi
- Pas d'erreurs TypeScript
- Warnings ESLint uniquement (non bloquants)
- Toutes les pages générées avec succès

---

## 👨‍💻 Auteur

Implémenté par Claude Code
Date : Octobre 2025
Version : V2.11
