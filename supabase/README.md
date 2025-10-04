# 🗄️ Configuration Supabase - Moneto V2

Ce dossier contient les migrations et la configuration de la base de données Supabase pour Moneto V2.

---

## 📋 Prérequis

- Un compte Supabase (gratuit : [https://supabase.com](https://supabase.com))
- Node.js 18+ installé
- Les variables d'environnement configurées (voir ci-dessous)

---

## 🚀 Configuration initiale

### 1. Créer un projet Supabase

1. Aller sur [https://app.supabase.com](https://app.supabase.com)
2. Cliquer sur **"New Project"**
3. Remplir les informations :
   - **Name** : `moneto-v2` (ou votre choix)
   - **Database Password** : Générer un mot de passe fort (noter quelque part !)
   - **Region** : Choisir la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free (suffisant pour commencer)
4. Cliquer sur **"Create new project"**
5. Attendre quelques minutes que le projet soit initialisé

### 2. Récupérer les clés d'API

Une fois le projet créé :

1. Aller dans **Settings** (icône engrenage dans la sidebar)
2. Cliquer sur **API**
3. Noter les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1...` (clé publique)
   - **service_role key** : `eyJhbGciOiJIUzI1...` (clé secrète, **ne JAMAIS commit**)

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

⚠️ **Important** :
- Utiliser uniquement la **anon key** (publique) dans `.env.local`
- **NE JAMAIS** commit `.env.local` dans Git (déjà dans `.gitignore`)
- **NE JAMAIS** exposer la **service_role key** côté client

---

## 🗃️ Appliquer les migrations

### Option 1 : Via l'interface Supabase (recommandé pour débuter)

1. Aller dans le **SQL Editor** de votre projet Supabase
2. Cliquer sur **"New query"**
3. Copier/coller le contenu de `migrations/20250104000000_initial_schema.sql`
4. Cliquer sur **"Run"** (ou `Ctrl/Cmd + Enter`)
5. Vérifier qu'il n'y a pas d'erreur dans la console

### Option 2 : Via Supabase CLI

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet local au projet Supabase
supabase link --project-ref xxxxx

# Appliquer les migrations
supabase db push
```

### Option 3 : Via psql (avancé)

```bash
# Récupérer la chaîne de connexion dans Settings > Database
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  -f migrations/20250104000000_initial_schema.sql
```

---

## ✅ Vérification de l'installation

Après avoir appliqué la migration, vérifier dans l'interface Supabase :

### 1. Vérifier la table

- Aller dans **Table Editor**
- Vous devriez voir la table `monthly_plans`
- Vérifier les colonnes : `id`, `user_id`, `plan_id`, `name`, `data`, `created_at`, `updated_at`

### 2. Vérifier les RLS policies

- Aller dans **Authentication** > **Policies**
- Sélectionner la table `monthly_plans`
- Vous devriez voir 4 policies :
  - ✅ `Users can view their own plans` (SELECT)
  - ✅ `Users can create their own plans` (INSERT)
  - ✅ `Users can update their own plans` (UPDATE)
  - ✅ `Users can delete their own plans` (DELETE)

### 3. Vérifier les indexes

- Aller dans **Database** > **Indexes**
- Vérifier la présence des indexes sur `user_id`, `plan_id`, etc.

---

## 🔒 Sécurité Row Level Security (RLS)

### Qu'est-ce que RLS ?

RLS (Row Level Security) est un système de sécurité qui garantit que :
- Chaque utilisateur ne peut accéder qu'à **ses propres données**
- Même si quelqu'un obtient votre clé API publique (anon key), il ne peut pas accéder aux données des autres utilisateurs
- Les requêtes sont automatiquement filtrées par `user_id`

### Comment ça fonctionne ?

Quand un utilisateur fait une requête :

```typescript
// Côté client (TypeScript)
const { data } = await supabase
  .from('monthly_plans')
  .select('*');
```

Supabase ajoute automatiquement un filtre :

```sql
-- Côté serveur (PostgreSQL)
SELECT * FROM monthly_plans
WHERE user_id = auth.uid(); -- UID de l'utilisateur connecté
```

### Tester RLS

Dans le **SQL Editor**, vous pouvez tester les policies :

```sql
-- Se connecter en tant qu'utilisateur de test
SELECT auth.uid(); -- Voir l'UUID de l'utilisateur actuel

-- Essayer de récupérer tous les plans (ne retournera que ceux de l'utilisateur)
SELECT * FROM monthly_plans;

-- Essayer d'insérer un plan pour un autre utilisateur (échouera)
INSERT INTO monthly_plans (user_id, plan_id, name, data)
VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'Test', '{}');
-- Erreur : new row violates row-level security policy
```

---

## 📊 Structure des données

### Format JSON stocké dans `data`

```json
{
  "month": "2025-01",
  "fixedIncomes": [
    {
      "id": "income-xxx",
      "name": "Salaire",
      "amount": 2500
    }
  ],
  "fixedExpenses": [
    {
      "id": "expense-xxx",
      "name": "Loyer",
      "amount": 800
    }
  ],
  "envelopes": [
    {
      "id": "env-xxx",
      "name": "Courses",
      "type": "percentage",
      "percentage": 30,
      "amount": 510
    },
    {
      "id": "env-yyy",
      "name": "Épargne",
      "type": "fixed",
      "percentage": 0,
      "amount": 500
    }
  ]
}
```

---

## 🔧 Maintenance

### Nettoyer les anciens plans (optionnel)

Si vous voulez supprimer les plans de plus de 2 ans :

```sql
-- Dans le SQL Editor
SELECT cleanup_old_plans(24); -- 24 mois = 2 ans
```

### Statistiques utilisateur

Voir les stats de tous les utilisateurs :

```sql
SELECT * FROM user_plan_stats;
```

### Backup de la base de données

Supabase fait des backups automatiques, mais vous pouvez aussi :

1. Aller dans **Database** > **Backups**
2. Télécharger un backup manuel si nécessaire

---

## 🐛 Résolution de problèmes

### Erreur : "relation does not exist"

La table n'a pas été créée. Réappliquer la migration.

### Erreur : "new row violates row-level security policy"

Vous essayez d'insérer des données pour un autre utilisateur. Vérifier que `user_id` correspond à `auth.uid()`.

### Erreur : "permission denied for table"

RLS est mal configuré. Vérifier les policies dans **Authentication** > **Policies**.

### Les données ne se synchronisent pas

1. Vérifier les variables d'environnement (`.env.local`)
2. Vérifier que l'utilisateur est bien authentifié
3. Regarder les logs dans la console navigateur
4. Regarder les logs Supabase dans **Logs** > **Postgres Logs**

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🆘 Support

Si vous avez des questions :
- Consulter la documentation Supabase
- Chercher sur [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)
- Demander sur [Discord Supabase](https://discord.supabase.com)

---

**Moneto V2 - Gestion financière par enveloppes**
