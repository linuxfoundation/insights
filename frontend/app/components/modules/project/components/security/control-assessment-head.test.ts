// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useQueryClient } from '@tanstack/vue-query';
import ControlAssessmentHead from './control-assessment-head.vue';
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
  useAuthStore: vi.fn(() => ({ isAuthenticated: { value: true } })),
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: vi.fn(() => ({
    selectedReposValues: { value: ['https://github.com/test/repo'] },
  })),
}));

vi.mock('~/components/modules/project/services/security.api.service', () => ({
  SECURITY_API_SERVICE: {
    triggerSecurityUpdate: vi.fn(),
  },
}));

vi.mock('~/components/uikit/button/button.vue', () => ({
  default: {
    name: 'LfxButton',
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
}));

vi.mock('~/components/uikit/tooltip/tooltip.vue', () => ({
  default: {
    name: 'LfxTooltip',
    template: '<div><slot /></div>',
  },
}));

vi.mock('~/components/uikit/spinner/spinner.vue', () => ({
  default: {
    name: 'LfxSpinner',
    template: '<div></div>',
  },
}));

vi.mock('~/components/uikit/icon/icon.vue', () => ({
  default: {
    name: 'LfxIcon',
    template: '<i></i>',
  },
}));

vi.mock('~/components/uikit/toast/toast.service', () => ({
  default: () => ({
    showToast: vi.fn(),
  }),
}));

describe('control-assessment-head.vue', () => {
  let mockQueryClient: any;
  let mockInvalidateQueries: any;
  let mockTriggerSecurityUpdate: any;

  beforeEach(() => {
    mockInvalidateQueries = vi.fn();
    mockQueryClient = {
      invalidateQueries: mockInvalidateQueries,
    };
    (useQueryClient as any).mockReturnValue(mockQueryClient);

    // Reset all mocks
    vi.clearAllMocks();
  });

  test('invalidateQueries is called with correct key after successful security update', async () => {
    const { SECURITY_API_SERVICE } =
      await import('~/components/modules/project/services/security.api.service');
    mockTriggerSecurityUpdate = SECURITY_API_SERVICE.triggerSecurityUpdate as any;
    mockTriggerSecurityUpdate.mockResolvedValue({ success: true });

    // Mount the component
    const wrapper = mount(ControlAssessmentHead, {
      global: {
        stubs: {
          LfxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          LfxTooltip: { template: '<div><slot /></div>' },
          LfxSpinner: { template: '<div></div>' },
          LfxIcon: { template: '<i></i>' },
        },
      },
    });

    // Find and click the update button
    const button = wrapper.find('button');
    await button.trigger('click');

    // Wait for async operations to complete
    await flushPromises();

    // Assert that invalidateQueries was called exactly once
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);

    // Assert that it was called with the correct query key
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: [TanstackKey.SECURITY_ASSESSMENT, 'test-project', ['https://github.com/test/repo']],
    });
  });

  test('invalidateQueries is not called when security update fails', async () => {
    const { SECURITY_API_SERVICE } =
      await import('~/components/modules/project/services/security.api.service');
    mockTriggerSecurityUpdate = SECURITY_API_SERVICE.triggerSecurityUpdate as any;
    mockTriggerSecurityUpdate.mockRejectedValue(new Error('Update failed'));

    // Mount the component
    const wrapper = mount(ControlAssessmentHead, {
      global: {
        stubs: {
          LfxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          LfxTooltip: { template: '<div><slot /></div>' },
          LfxSpinner: { template: '<div></div>' },
          LfxIcon: { template: '<i></i>' },
        },
      },
    });

    // Find and click the update button
    const button = wrapper.find('button');
    await button.trigger('click');

    // Wait for async operations to complete
    await flushPromises();

    // Assert that invalidateQueries was NOT called
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
