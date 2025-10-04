# 🧪 Guide de test - Moneto V2

Documentation complète pour tester la synchronisation cloud et les fonctionnalités de l'application.

> **⚠️ Note importante** : Les tests unitaires automatisés testent les utilitaires de base (debouncing, retry logic, auth, types). Les tests d'intégration complets de synchronisation (upload/download/conflits) sont disponibles dans `__tests__/manual/` pour référence et doivent être exécutés manuellement avec un vrai environnement Supabase ou via l'outil de debug UI à `/dev/sync-test`.

## 📋 Table des matières

1. [Installation](#installation)
2. [Exécution des tests](#exécution-des-tests)
3. [Structure des tests](#structure-des-tests)
4. [Tests automatisés](#tests-automatisés)
5. [Tests manuels et E2E](#tests-manuels-et-e2e)
6. [Outil de debug UI](#outil-de-debug-ui)
7. [Scénarios de test critiques](#scénarios-de-test-critiques)
8. [Débogage](#débogage)

---

## Installation

Les dépendances de test sont déjà installées dans le projet :

- **Vitest** : Framework de test moderne pour Vite/React
- **@testing-library/react** : Utilitaires pour tester les composants React
- **@testing-library/jest-dom** : Matchers personnalisés pour les assertions DOM
- **happy-dom** : Environnement DOM léger pour les tests

## Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests une fois
npm run test

# Mode watch (re-exécution automatique)
npm run test -- --watch

# Interface UI interactive
npm run test:ui

# Avec couverture de code
npm run test:coverage

# Exécuter seulement les tests d'un fichier
npm run test -- auth.test.ts

# Exécuter seulement les tests unitaires
npm run test -- __tests__/unit

# Exécuter seulement les tests d'intégration
npm run test -- __tests__/integration

# Exécuter seulement les tests de performance
npm run test -- __tests__/performance
```

## Structure des tests

```
__tests__/
├── helpers/              # Utilitaires et mocks partagés
│   ├── supabase-mock.ts  # Mocks du client Supabase
│   ├── test-data.ts      # Données de test
│   └── test-utils.tsx    # Fonctions utilitaires
│
├── unit/                 # Tests unitaires (exécutés automatiquement)
│   ├── auth.test.ts      # Tests d'authentification ✅
│   ├── sync.test.ts      # Tests utilitaires (debounce, retry) ✅
│   └── types.test.ts     # Tests de conversion de types ✅
│
├── manual/               # Tests E2E (exécution manuelle requise)
│   ├── integration/      # Tests d'intégration complète
│   │   └── sync-full.test.ts
│   └── performance/      # Benchmarks de performance
│       └── sync-benchmarks.test.ts
│
setup.ts                  # Configuration globale des tests
```

**Note** : Les tests dans `__tests__/manual/` nécessitent un environnement Supabase configuré et doivent être exécutés manuellement. Utilisez l'outil de debug UI à `/dev/sync-test` pour des tests interactifs en environnement réel.

## Tests automatisés

### Tests unitaires

Les tests unitaires vérifient le bon fonctionnement de chaque fonction individuellement.

#### auth.test.ts
- ✅ Création de compte (signUp)
- ✅ Connexion (signIn)
- ✅ Déconnexion (signOut)
- ✅ Récupération de l'utilisateur actuel
- ✅ Gestion des erreurs d'authentification

#### sync.test.ts
- ✅ Upload d'un plan vers le cloud
- ✅ Download de plans depuis le cloud
- ✅ Résolution de conflits (last-write-wins)
- ✅ Synchronisation complète
- ✅ Suppression d'un plan
- ✅ Debouncing de sync
- ✅ Retry logic

#### types.test.ts
- ✅ Conversion MonthlyPlan → row DB
- ✅ Conversion row DB → MonthlyPlan
- ✅ Intégrité des données après conversion bidirectionnelle

### Tests d'intégration

Les tests d'intégration vérifient les scénarios complets de synchronisation.

#### Scénarios testés :
1. **Premier upload** : Upload de plans locaux vers un cloud vide
2. **Download et fusion** : Télécharger des plans du cloud et fusionner avec les plans locaux
3. **Conflits multiples** : Résolution de plusieurs conflits avec last-write-wins
4. **Progression** : Callback de progression lors de la sync
5. **Erreurs partielles** : Continuer la sync même si certains plans échouent
6. **Synchronisation bidirectionnelle** : Sync dans les deux sens (local ↔ cloud)

### Tests de performance

Les tests de performance mesurent les temps d'exécution des opérations critiques.

#### Benchmarks :
- Upload d'un plan : **< 100ms** (mock)
- Upload de 10 plans : **< 1s**
- Download de 10/50/100 plans : selon les seuils définis
- Sync complète avec conflits : **< 3s** pour 20 plans

## Tests manuels et E2E

### Approche recommandée : Outil de debug UI

L'outil de debug UI à `/dev/sync-test` est la méthode recommandée pour tester la synchronisation en environnement réel :

1. Se connecter avec un compte Supabase de test
2. Utiliser les 5 tests interactifs disponibles :
   - Upload basique
   - Download
   - Sync complète
   - Simulation de conflit
   - Benchmark de performance
3. Observer les logs en temps réel dans la console

### Tests E2E avec Vitest (manuel)

Les tests dans `__tests__/manual/` peuvent être exécutés manuellement :

```bash
# Configurer les variables d'environnement Supabase
# Puis exécuter les tests manuels
npm run test -- __tests__/manual
```

**⚠️ Important** : Ces tests nécessitent :
- Un projet Supabase configuré avec les bonnes RLS policies
- Les variables d'environnement `.env.local` configurées
- Une connexion internet stable

### Prérequis pour tests manuels

1. Créer un compte Supabase de test
2. Configurer les variables d'environnement
3. Avoir au moins 2 appareils/navigateurs différents

### Scénarios à tester

#### 1. Synchronisation multi-appareils

**Objectif** : Vérifier que les modifications se propagent entre appareils.

**Étapes** :
1. Sur l'appareil A :
   - Se connecter avec le même compte
   - Créer un plan mensuel "Test-Multi-Device"
   - Ajouter des revenus et dépenses
2. Sur l'appareil B :
   - Se connecter avec le même compte
   - Attendre la synchronisation (ou forcer une sync)
   - ✅ Vérifier que le plan "Test-Multi-Device" apparaît
3. Sur l'appareil B :
   - Modifier le plan (ajouter une enveloppe)
4. Sur l'appareil A :
   - Forcer une synchronisation
   - ✅ Vérifier que les modifications apparaissent

#### 2. Résolution de conflits

**Objectif** : Tester la stratégie last-write-wins.

**Étapes** :
1. Sur l'appareil A :
   - Modifier un plan (ex: ajouter un revenu)
   - **NE PAS** synchroniser immédiatement
2. Sur l'appareil B :
   - Modifier le MÊME plan (ex: ajouter une dépense)
   - Synchroniser
3. Sur l'appareil A :
   - Synchroniser maintenant
   - ✅ Vérifier que la version la plus récente a été conservée
   - ✅ Vérifier dans les logs qu'un conflit a été détecté

#### 3. Migration des données locales

**Objectif** : Vérifier l'import des données locales lors de la première connexion.

**Étapes** :
1. En mode non-connecté :
   - Créer 3-5 plans mensuels
   - Remplir avec des données variées
2. Créer un nouveau compte :
   - ✅ Vérifier que la modal de migration apparaît
   - ✅ Vérifier le nombre de plans détectés
3. Accepter la migration :
   - ✅ Vérifier que tous les plans sont migrés
   - ✅ Vérifier que les données locales sont toujours présentes
4. Sur un autre appareil :
   - Se connecter avec le même compte
   - ✅ Vérifier que tous les plans migrés sont téléchargés

#### 4. Mode hors-ligne → en ligne

**Objectif** : Vérifier la synchronisation après une période hors-ligne.

**Étapes** :
1. Se connecter et créer un plan
2. Passer en mode hors-ligne (désactiver le réseau)
3. Modifier le plan (ajouter des enveloppes)
4. Tenter de synchroniser :
   - ✅ Vérifier qu'une erreur est affichée
5. Repasser en ligne
6. Synchroniser :
   - ✅ Vérifier que les modifications sont envoyées
   - ✅ Vérifier qu'aucune donnée n'est perdue

#### 5. Stress test

**Objectif** : Vérifier les performances avec beaucoup de données.

**Étapes** :
1. Créer 20-30 plans mensuels
2. Remplir chaque plan avec 10+ revenus/dépenses/enveloppes
3. Se connecter et synchroniser :
   - ✅ Mesurer le temps de synchronisation
   - ✅ Vérifier qu'il n'y a pas de freeze de l'UI
   - ✅ Vérifier que tous les plans sont synchronisés

## Outil de debug UI

### Accès

Aller sur `/dev/sync-test` (uniquement accessible en développement et si connecté).

### Fonctionnalités

L'outil de debug offre 5 tests interactifs :

1. **Upload basique** : Upload d'un plan avec mesure de temps
2. **Download** : Téléchargement de tous les plans
3. **Sync complète** : Synchronisation bidirectionnelle
4. **Simuler conflit** : Créer et résoudre un conflit
5. **Benchmark** : Mesurer les performances globales

### Utilisation

1. Se connecter avec un compte de test
2. Naviguer vers `/dev/sync-test`
3. Cliquer sur un des boutons de test
4. Observer les logs dans la console

Les résultats sont affichés en JSON et les logs en temps réel dans la console.

## Scénarios de test critiques

Avant chaque release, valider ces scénarios :

### ✅ Checklist de validation

- [ ] **Auth** : Création de compte, connexion, déconnexion
- [ ] **Sync initiale** : Premier upload de plans locaux
- [ ] **Multi-appareils** : Modifications propagées entre 2 appareils
- [ ] **Conflits** : Résolution correcte avec last-write-wins
- [ ] **Migration** : Import de données locales → cloud
- [ ] **Hors-ligne** : Pas de perte de données après reconnexion
- [ ] **Erreurs réseau** : Gestion gracieuse des erreurs
- [ ] **Performance** : Sync de 20 plans < 5s
- [ ] **UI** : SyncIndicator affiche le bon statut
- [ ] **UI** : SyncButton fonctionne correctement
- [ ] **Page profil** : Toutes les infos sont correctes

## Débogage

### Logs de synchronisation

Pour activer les logs détaillés :

```typescript
import { syncLogger } from '@/lib/diagnostics/sync-logger';

// Récupérer les logs
const logs = syncLogger.getRecentLogs(20);
console.log(logs);

// Exporter les logs
const logsJSON = syncLogger.export();
```

### Métriques de performance

Pour analyser les performances :

```typescript
import { performanceTracker } from '@/lib/diagnostics/performance-tracker';

// Récupérer les statistiques
const stats = performanceTracker.getAllStats();
console.log(stats);

// Exporter les métriques
const metricsJSON = performanceTracker.export();
```

### Problèmes courants

#### Les tests échouent avec "Cannot find module"

**Solution** : Vérifier que les alias de chemins sont bien configurés dans `vitest.config.ts`.

#### Les tests échouent avec "supabase is not defined"

**Solution** : S'assurer que les mocks sont bien définis dans chaque fichier de test avec `vi.mock()`.

#### Les tests de performance sont trop lents

**Solution** : Les benchmarks mesurent des opérations mockées. Si c'est trop lent, vérifier que les mocks sont bien configurés et pas de vrais appels réseau.

#### La synchronisation ne fonctionne pas en production

**Solution** :
1. Vérifier les variables d'environnement Supabase
2. Vérifier les RLS policies dans Supabase
3. Consulter les logs de synchronisation
4. Utiliser l'outil `/dev/sync-test` pour débugger

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs de synchronisation
2. Utiliser l'outil de debug UI
3. Vérifier la console du navigateur
4. Consulter les logs Supabase

Bonne chance avec les tests ! 🚀
