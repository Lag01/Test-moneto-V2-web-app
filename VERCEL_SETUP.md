# Configuration Vercel pour Moneto V2

Ce guide explique comment configurer les variables d'environnement Supabase sur Vercel pour activer la synchronisation cloud.

## Variables d'environnement nécessaires

Pour activer la synchronisation cloud (fonctionnalités premium), vous devez configurer les variables d'environnement suivantes sur Vercel :

- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme (anon key) de votre projet Supabase

## Étapes de configuration

### 1. Récupérer les informations Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet Moneto
3. Allez dans **Settings** > **API**
4. Copiez les valeurs suivantes :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurer les variables sur Vercel

#### Via le Dashboard Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Sélectionnez votre projet Moneto
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez les deux variables suivantes :

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |

5. Cliquez sur **Save** pour chaque variable

#### Via Vercel CLI

```bash
# Installation de Vercel CLI (si nécessaire)
npm i -g vercel

# Connexion à Vercel
vercel login

# Lier votre projet local
vercel link

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Pour chaque variable, spécifiez les environnements : Production, Preview, Development
```

### 3. Redéployer l'application

Après avoir ajouté les variables d'environnement, vous devez redéployer votre application :

#### Via le Dashboard Vercel

1. Allez dans l'onglet **Deployments**
2. Cliquez sur **Redeploy** sur le dernier déploiement

#### Via Git

Faites un nouveau commit et push :

```bash
git commit --allow-empty -m "Trigger redeploy with Supabase env vars"
git push
```

#### Via Vercel CLI

```bash
vercel --prod
```

## Vérification

Après le déploiement :

1. Visitez votre application déployée
2. Allez sur `/auth/login` ou `/auth/signup`
3. Si les variables sont correctement configurées, vous devriez voir les formulaires de connexion/inscription
4. Si les variables ne sont pas configurées, vous verrez un message "Synchronisation cloud non disponible" avec un bouton pour continuer en mode local

## Mode local sans Supabase

L'application fonctionne également **sans** configuration Supabase :

- Tous les utilisateurs peuvent utiliser l'application en mode local uniquement
- Les données sont stockées dans le navigateur (IndexedDB/localStorage)
- Export/import manuel des données au format JSON disponible
- Aucune synchronisation cloud

## Dépannage

### Erreur : "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Cause** : Les variables d'environnement ne sont pas configurées sur Vercel.

**Solution** :
1. Vérifiez que vous avez bien ajouté les deux variables dans **Settings** > **Environment Variables**
2. Redéployez l'application après avoir ajouté les variables

### Les pages d'authentification affichent "Synchronisation cloud non disponible"

**Cause** : Les variables d'environnement ne sont pas présentes dans le build.

**Solutions** :
1. Vérifiez que les variables commencent bien par `NEXT_PUBLIC_`
2. Vérifiez que les variables sont configurées pour l'environnement approprié (Production/Preview/Development)
3. Redéployez l'application

### Les variables sont configurées mais ne fonctionnent pas

**Cause** : Les variables ont été ajoutées après le dernier build.

**Solution** : Redéployez l'application pour que les nouvelles variables soient prises en compte.

## Support

Pour plus d'informations :
- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Supabase - API Keys](https://supabase.com/docs/guides/api#api-url-and-keys)
