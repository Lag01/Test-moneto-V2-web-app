import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadPlanToCloud,
  downloadPlansFromCloud,
  syncAllPlans,
} from '@/lib/supabase/sync';
import { createMockMonthlyPlans, createMockPlanRow } from '../helpers/test-data';

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

describe('Tests de performance - Synchronisation', () => {
  const userId = 'perf-test-user';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Benchmarks d\'upload', () => {
    it('devrait uploader un plan en moins de 100ms (mock)', async () => {
      const plan = createMockMonthlyPlans(1)[0];
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

      const startTime = performance.now();
      await uploadPlanToCloud(plan, userId);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('devrait mesurer le temps d\'upload pour 10 plans', async () => {
      const plans = createMockMonthlyPlans(10);
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

      const startTime = performance.now();
      await syncAllPlans(plans, userId);
      const endTime = performance.now();

      const duration = endTime - startTime;
      const averagePerPlan = duration / plans.length;

      console.log(`📊 Performance - Upload de ${plans.length} plans:`);
      console.log(`   Temps total: ${duration.toFixed(2)}ms`);
      console.log(`   Moyenne par plan: ${averagePerPlan.toFixed(2)}ms`);

      expect(duration).toBeLessThan(1000); // Moins de 1 seconde pour 10 plans
    });
  });

  describe('Benchmarks de download', () => {
    it.each([
      { count: 10, maxDuration: 500 },
      { count: 50, maxDuration: 1500 },
      { count: 100, maxDuration: 3000 },
    ])('devrait télécharger $count plans en moins de $maxDuration ms', async ({ count, maxDuration }) => {
      const cloudPlans = createMockMonthlyPlans(count);
      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      const cloudRows = cloudPlans.map((p) => createMockPlanRow(p, userId));

      mockFrom().order = vi.fn().mockResolvedValue({
        data: cloudRows,
        error: null,
      });

      const startTime = performance.now();
      const result = await downloadPlansFromCloud(userId);
      const endTime = performance.now();

      const duration = endTime - startTime;

      console.log(`📊 Performance - Download de ${count} plans:`);
      console.log(`   Temps: ${duration.toFixed(2)}ms`);
      console.log(`   Moyenne par plan: ${(duration / count).toFixed(2)}ms`);

      expect(result.success).toBe(true);
      expect(result.plans).toHaveLength(count);
      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Benchmarks de synchronisation complète', () => {
    it('devrait mesurer les performances d\'une sync complète avec conflits', async () => {
      const localPlans = createMockMonthlyPlans(20);
      const { supabase } = await import('@/lib/supabase/client');
      const mockFrom = vi.mocked(supabase.from);

      // Simuler que la moitié des plans existent déjà
      let callCount = 0;
      mockFrom().single = vi.fn(() => {
        callCount++;
        if (callCount % 2 === 0) {
          // Plan existe sur le cloud
          const plan = localPlans[Math.floor(callCount / 2) - 1];
          const row = createMockPlanRow(plan, userId);
          return Promise.resolve({ data: row, error: null });
        } else {
          // Plan n'existe pas
          return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
        }
      });

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

      const startTime = performance.now();
      const result = await syncAllPlans(localPlans, userId);
      const endTime = performance.now();

      const duration = endTime - startTime;
      const averagePerPlan = duration / localPlans.length;

      console.log(`📊 Performance - Sync complète de ${localPlans.length} plans:`);
      console.log(`   Temps total: ${duration.toFixed(2)}ms`);
      console.log(`   Moyenne par plan: ${averagePerPlan.toFixed(2)}ms`);
      console.log(`   Plans synchronisés: ${result.synced}`);
      console.log(`   Conflits: ${result.conflicts || 0}`);

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(3000); // Moins de 3 secondes pour 20 plans
    });
  });

  describe('Rapport de performance', () => {
    it('devrait générer un rapport de performance JSON', async () => {
      const testSizes = [5, 10, 20];
      const report: Array<{
        size: number;
        uploadTime: number;
        downloadTime: number;
        avgPerPlan: number;
      }> = [];

      for (const size of testSizes) {
        const plans = createMockMonthlyPlans(size);
        const { supabase } = await import('@/lib/supabase/client');
        const mockFrom = vi.mocked(supabase.from);

        // Upload
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

        const uploadStart = performance.now();
        await syncAllPlans(plans, userId);
        const uploadEnd = performance.now();
        const uploadTime = uploadEnd - uploadStart;

        // Download
        const cloudRows = plans.map((p) => createMockPlanRow(p, userId));
        mockFrom().order = vi.fn().mockResolvedValue({
          data: cloudRows,
          error: null,
        });

        const downloadStart = performance.now();
        await downloadPlansFromCloud(userId);
        const downloadEnd = performance.now();
        const downloadTime = downloadEnd - downloadStart;

        report.push({
          size,
          uploadTime: parseFloat(uploadTime.toFixed(2)),
          downloadTime: parseFloat(downloadTime.toFixed(2)),
          avgPerPlan: parseFloat(((uploadTime + downloadTime) / (size * 2)).toFixed(2)),
        });
      }

      console.log('\n📊 Rapport de performance:');
      console.log(JSON.stringify(report, null, 2));

      // Vérifier que les performances se dégradent linéairement (pas exponentiellement)
      const scalingFactor = report[2].avgPerPlan / report[0].avgPerPlan;
      expect(scalingFactor).toBeLessThan(2); // Scaling acceptable
    });
  });
});
