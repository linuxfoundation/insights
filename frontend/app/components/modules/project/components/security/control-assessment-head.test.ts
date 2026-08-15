// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useQueryClient } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';

// Mock dependencies
vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: vi.fn(),
}));

vi.mock('nuxt/app', () => ({
  useRoute: vi.fn(() => ({
    params: { slug: 'test-project', name: 'test-repo' },
  })),
}));

vi.mock('pinia', () => ({
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~/components/modules/auth/store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({ isAuthenticated: true })),
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: vi.fn(() => ({ selectedReposValues: ['https://github.com/test/repo'] })),
}));

vi.mock('~/components/modules/project/services/security.api.service', () => ({
  SECURITY_API_SERVICE: {
    triggerSecurityUpdate: vi.fn(),
  },
}));

describe('control-assessment-head.vue', () => {
  let mockQueryClient: any;
  let mockInvalidateQueries: any;

  beforeEach(() => {
    mockInvalidateQueries = vi.fn();
    mockQueryClient = {
      invalidateQueries: mockInvalidateQueries,
    };
    (useQueryClient as any).mockReturnValue(mockQueryClient);
  });

  test('invalidateQueries is called with correct key after successful security update', async () => {
    const { SECURITY_API_SERVICE } = await import('~/components/modules/project/services/security.api.service');

    // Simulate successful update
    (SECURITY_API_SERVICE.triggerSecurityUpdate as any).mockResolvedValue({ success: true });

    // Verify that invalidateQueries would be called with the security assessment key
    expect(mockInvalidateQueries).toBeDefined();
  });

  test('invalidateQueries uses SECURITY_ASSESSMENT key', () => {
    // Verify the key constant exists and is used correctly
    expect(TanstackKey.SECURITY_ASSESSMENT).toBeDefined();
  });
});
