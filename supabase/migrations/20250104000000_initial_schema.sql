-- ============================================================================
-- Moneto V2 - Schéma de base de données initial
-- ============================================================================
-- Description : Ce fichier contient le schéma complet de la base de données
--              pour l'application Moneto V2 avec synchronisation cloud.
-- Date : 04 Janvier 2025
-- Version : 1.0.0
-- ============================================================================

-- ============================================================================
-- 1. Extension UUID (pour la génération automatique d'UUIDs)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Table monthly_plans
-- ============================================================================
-- Stocke les plans mensuels des utilisateurs avec leurs données financières
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.monthly_plans (
    -- Identifiant unique de la ligne (UUID auto-généré)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Référence à l'utilisateur (lien avec auth.users de Supabase Auth)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identifiant du plan (vient de l'application, permet de synchroniser)
    -- Exemple : "plan-1704326400000-a1b2c3"
    plan_id TEXT NOT NULL,

    -- Nom du plan (ex: "Plan 2025-01")
    name TEXT NOT NULL,

    -- Données JSON du plan (revenus, dépenses, enveloppes)
    -- Structure : { month, fixedIncomes, fixedExpenses, envelopes }
    data JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Horodatage de création
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Horodatage de dernière modification
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Contrainte d'unicité : un utilisateur ne peut pas avoir deux plans
    -- avec le même plan_id
    CONSTRAINT unique_user_plan UNIQUE(user_id, plan_id)
);

-- ============================================================================
-- 3. Indexes pour performance
-- ============================================================================

-- Index sur user_id pour accélérer les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_monthly_plans_user_id
    ON public.monthly_plans(user_id);

-- Index sur plan_id pour accélérer les recherches par plan_id
CREATE INDEX IF NOT EXISTS idx_monthly_plans_plan_id
    ON public.monthly_plans(plan_id);

-- Index composite pour les requêtes combinées
CREATE INDEX IF NOT EXISTS idx_monthly_plans_user_plan
    ON public.monthly_plans(user_id, plan_id);

-- Index sur created_at pour le tri chronologique
CREATE INDEX IF NOT EXISTS idx_monthly_plans_created_at
    ON public.monthly_plans(created_at DESC);

-- Index sur les données JSON pour les requêtes avancées (optionnel)
-- Permet de rechercher dans les données JSON si nécessaire
CREATE INDEX IF NOT EXISTS idx_monthly_plans_data_month
    ON public.monthly_plans((data->>'month'));

-- ============================================================================
-- 4. Trigger pour mettre à jour automatiquement updated_at
-- ============================================================================

-- Fonction qui met à jour updated_at à chaque modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui appelle la fonction avant chaque UPDATE
DROP TRIGGER IF EXISTS set_updated_at ON public.monthly_plans;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.monthly_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================
-- Sécurise les données : chaque utilisateur ne peut accéder qu'à ses propres plans
-- ============================================================================

-- Activer RLS sur la table
ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Policy 1 : SELECT (Lecture)
-- Un utilisateur peut lire uniquement ses propres plans
-- ============================================================================
CREATE POLICY "Users can view their own plans"
    ON public.monthly_plans
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- Policy 2 : INSERT (Création)
-- Un utilisateur peut créer des plans uniquement pour lui-même
-- ============================================================================
CREATE POLICY "Users can create their own plans"
    ON public.monthly_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Policy 3 : UPDATE (Modification)
-- Un utilisateur peut modifier uniquement ses propres plans
-- ============================================================================
CREATE POLICY "Users can update their own plans"
    ON public.monthly_plans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Policy 4 : DELETE (Suppression)
-- Un utilisateur peut supprimer uniquement ses propres plans
-- ============================================================================
CREATE POLICY "Users can delete their own plans"
    ON public.monthly_plans
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Grants (Permissions)
-- ============================================================================
-- Donne les permissions nécessaires aux utilisateurs authentifiés
-- ============================================================================

-- Autoriser les utilisateurs authentifiés à faire toutes les opérations
-- sur leurs propres données (géré par les RLS policies ci-dessus)
GRANT ALL ON public.monthly_plans TO authenticated;

-- Autoriser la lecture du schéma public aux utilisateurs anonymes
-- (nécessaire pour Supabase)
GRANT USAGE ON SCHEMA public TO anon;

-- Les utilisateurs anonymes ne peuvent rien faire sur cette table
-- (pas de policy pour anon = accès refusé)

-- ============================================================================
-- 7. Commentaires de documentation
-- ============================================================================

COMMENT ON TABLE public.monthly_plans IS
'Stocke les plans mensuels de gestion financière des utilisateurs.
Chaque plan contient les revenus fixes, dépenses fixes et enveloppes d''allocation.
Protégé par RLS : chaque utilisateur ne peut accéder qu''à ses propres plans.';

COMMENT ON COLUMN public.monthly_plans.id IS
'Identifiant unique UUID de la ligne (généré automatiquement)';

COMMENT ON COLUMN public.monthly_plans.user_id IS
'Référence à l''utilisateur propriétaire du plan (auth.users.id)';

COMMENT ON COLUMN public.monthly_plans.plan_id IS
'Identifiant du plan côté application (permet la synchronisation)';

COMMENT ON COLUMN public.monthly_plans.name IS
'Nom lisible du plan (ex: "Plan 2025-01")';

COMMENT ON COLUMN public.monthly_plans.data IS
'Données JSON du plan : { month, fixedIncomes, fixedExpenses, envelopes }';

COMMENT ON COLUMN public.monthly_plans.created_at IS
'Date et heure de création du plan';

COMMENT ON COLUMN public.monthly_plans.updated_at IS
'Date et heure de dernière modification (mise à jour automatique par trigger)';

-- ============================================================================
-- 8. Fonction helper pour nettoyer les anciens plans (optionnel)
-- ============================================================================
-- Peut être utilisée par un cron job Supabase pour supprimer les plans
-- très anciens et libérer de l'espace
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_plans(months_old INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les plans plus vieux que X mois
    DELETE FROM public.monthly_plans
    WHERE created_at < NOW() - (months_old || ' months')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_old_plans IS
'Supprime les plans mensuels créés il y a plus de X mois (par défaut 24).
Peut être appelée manuellement ou via un cron job Supabase.';

-- ============================================================================
-- 9. Vue pour statistiques utilisateur (optionnel)
-- ============================================================================
-- Vue utile pour afficher des statistiques agrégées par utilisateur
-- ============================================================================

CREATE OR REPLACE VIEW public.user_plan_stats AS
SELECT
    user_id,
    COUNT(*) as total_plans,
    MIN(created_at) as first_plan_date,
    MAX(created_at) as last_plan_date,
    MAX(updated_at) as last_activity
FROM public.monthly_plans
GROUP BY user_id;

COMMENT ON VIEW public.user_plan_stats IS
'Statistiques agrégées par utilisateur : nombre de plans, dates de premier/dernier plan, dernière activité';

-- Appliquer RLS à la vue aussi
ALTER VIEW public.user_plan_stats SET (security_invoker = true);

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================
-- Ce schéma est prêt à être déployé sur Supabase via :
-- 1. L'interface web Supabase (SQL Editor)
-- 2. Supabase CLI : supabase db push
-- 3. Migration manuelle avec psql
-- ============================================================================
