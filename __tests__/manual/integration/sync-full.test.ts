import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadPlanToCloud,
  downloadPlansFromCloud,
  syncAllPlans,
} from '@/lib/supabase/sync';
import { createMockMonthlyPlans, createMockPlanWithTimestamp, createMockPlanRow } from '../helpers/test-data';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Tests d\'intégration - Synchronisation complète', () => {
  const userId = 'integration-test-user';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scénario 1: Premier upload de plans locaux', () => {
    it('devrait uploader tous les plans locaux vers un cloud vide', async () => {
      const localPlans = createMockMonthlyPlans(5);
      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      // Mock : aucun plan n'existe sur le cloud
      mockFrom().single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().order = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await syncAllPlans(localPlans, userId);

      expect(result.success).toBe(true);
      expect(result.synced).toBe(5);
      expect(result.plans).toHaveLength(5);
      expect(result.conflicts).toBe(0);
    });
  });

  describe('Scénario 2: Download de plans depuis le cloud', () => {
    it('devrait télécharger et fusionner les plans du cloud avec les plans locaux', async () => {
      const localPlans = createMockMonthlyPlans(2);
      const cloudPlans = createMockMonthlyPlans(3).slice(2, 5); // Plans différents
      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      // Mock : plans locaux existent déjà sur le cloud
      mockFrom().single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock : retourner des plans supplémentaires du cloud
      const cloudRows = cloudPlans.map((p) => createMockPlanRow(p, userId));
      mockFrom().order = vi.fn().mockResolvedValue({
        data: cloudRows,
        error: null,
      });

      const result = await syncAllPlans(localPlans, userId);

      expect(result.success).toBe(true);
      expect(result.plans!.length).toBe(5); // 2 locaux + 3 du cloud
    });
  });

  describe('Scénario 3: Résolution de conflits multiples', () => {
    it('devrait gérer plusieurs conflits avec last-write-wins', async () => {
      const now = Date.now();

      // 3 plans locaux
      const localPlans = [
        createMockPlanWithTimestamp('plan-1', new Date(now).toISOString()), // Local plus récent
        createMockPlanWithTimestamp('plan-2', new Date(now - 10000).toISOString()), // Cloud plus récent
        createMockPlanWithTimestamp('plan-3', new Date(now).toISOString()), // Nouveau plan
      ];

      // 2 plans sur le cloud
      const cloudPlan1 = createMockPlanWithTimestamp('plan-1', new Date(now - 5000).toISOString());
      const cloudPlan2 = createMockPlanWithTimestamp('plan-2', new Date(now).toISOString());

      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      const cloudRow1 = createMockPlanRow(cloudPlan1, userId);
      const cloudRow2 = createMockPlanRow(cloudPlan2, userId);

      // Mock pour chaque plan lors de syncPlan
      mockFrom().single = vi.fn()
        // plan-1 : existe sur le cloud (version plus ancienne)
        .mockResolvedValueOnce({ data: cloudRow1, error: null })
        // plan-1 : mise à jour
        .mockResolvedValueOnce({ data: { id: 'db-plan-1', updated_at: cloudPlan1.updatedAt }, error: null })
        // plan-2 : existe sur le cloud (version plus récente)
        .mockResolvedValueOnce({ data: cloudRow2, error: null })
        // plan-3 : n'existe pas sur le cloud
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      mockFrom().update = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().order = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await syncAllPlans(localPlans, userId);

      expect(result.success).toBe(true);
      expect(result.synced).toBe(3);
      expect(result.conflicts).toBe(2); // plan-1 et plan-2

      // Vérifier que les bons plans ont été gardés
      const syncedPlan1 = result.plans!.find((p) => p.id === 'plan-1');
      const syncedPlan2 = result.plans!.find((p) => p.id === 'plan-2');

      expect(syncedPlan1?.updatedAt).toBe(localPlans[0].updatedAt); // Local plus récent
      expect(syncedPlan2?.updatedAt).toBe(cloudPlan2.updatedAt); // Cloud plus récent
    });
  });

  describe('Scénario 4: Synchronisation avec progression', () => {
    it('devrait rapporter la progression de la synchronisation', async () => {
      const localPlans = createMockMonthlyPlans(10);
      const progressUpdates: Array<{ current: number; total: number }> = [];

      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      mockFrom().single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().order = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      await syncAllPlans(localPlans, userId, (current, total) => {
        progressUpdates.push({ current, total });
      });

      expect(progressUpdates).toHaveLength(10);
      expect(progressUpdates[0]).toEqual({ current: 1, total: 10 });
      expect(progressUpdates[9]).toEqual({ current: 10, total: 10 });
    });
  });

  describe('Scénario 5: Gestion d\'erreurs partielles', () => {
    it('devrait continuer la synchronisation même si certains plans échouent', async () => {
      const localPlans = createMockMonthlyPlans(3);
      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      mockFrom().single = vi.fn()
        // plan-1 : succès
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        // plan-2 : erreur
        .mockResolvedValueOnce({ data: null, error: { message: 'Network error' } })
        // plan-3 : succès
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().order = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await syncAllPlans(localPlans, userId);

      expect(result.success).toBe(true);
      // 2 plans synchronisés (plan-1 et plan-3), plan-2 a échoué mais est gardé localement
      expect(result.synced).toBe(2);
      expect(result.plans).toHaveLength(3); // Tous les plans sont conservés
    });
  });

  describe('Scénario 6: Synchronisation bidirectionnelle', () => {
    it('devrait synchroniser correctement dans les deux sens', async () => {
      // 2 plans locaux + 2 plans cloud (1 en commun)
      const now = Date.now();
      const localPlans = [
        createMockPlanWithTimestamp('plan-shared', new Date(now).toISOString()),
        createMockPlanWithTimestamp('plan-local-only', new Date(now).toISOString()),
      ];

      const cloudPlanShared = createMockPlanWithTimestamp('plan-shared', new Date(now - 5000).toISOString());
      const cloudPlanCloudOnly = createMockPlanWithTimestamp('plan-cloud-only', new Date(now).toISOString());

      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      const cloudRowShared = createMockPlanRow(cloudPlanShared, userId);
      const cloudRowCloudOnly = createMockPlanRow(cloudPlanCloudOnly, userId);

      mockFrom().single = vi.fn()
        // plan-shared : existe sur le cloud (version plus ancienne)
        .mockResolvedValueOnce({ data: cloudRowShared, error: null })
        .mockResolvedValueOnce({ data: { id: 'db-plan-shared', updated_at: cloudPlanShared.updatedAt }, error: null })
        // plan-local-only : n'existe pas sur le cloud
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      mockFrom().update = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockFrom().insert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      // Download : retourner les 2 plans du cloud
      mockFrom().order = vi.fn().mockResolvedValue({
        data: [cloudRowShared, cloudRowCloudOnly],
        error: null,
      });

      const result = await syncAllPlans(localPlans, userId);

      expect(result.success).toBe(true);
      expect(result.plans).toHaveLength(3); // plan-shared + plan-local-only + plan-cloud-only

      const planIds = result.plans!.map((p) => p.id).sort();
      expect(planIds).toEqual(['plan-cloud-only', 'plan-local-only', 'plan-shared']);
    });
  });
});
