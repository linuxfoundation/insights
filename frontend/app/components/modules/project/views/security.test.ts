// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { shallowMount } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import SecurityView from './security.vue';

const mocks = await vi.hoisted(async () => {
  const { ref } = await import('vue');
  return {
    project: ref<Record<string, unknown> | undefined>(),
    loading: ref(false),
  };
});

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRoute: vi.fn(() => ({ params: { slug: 'kubernetes' } })),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~/components/modules/auth/store/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated: { value: true } }),
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: () => ({
    project: mocks.project,
    isProjectLoading: mocks.loading,
    selectedReposValues: { value: [] },
    isArchived: { value: false },
    emptyStateTitle: { value: '' },
    emptyStateDescription: { value: '' },
    hasSelectedArchivedRepos: { value: false },
  }),
}));

vi.mock('~/components/modules/project/services/security.api.service', () => ({
  SECURITY_API_SERVICE: {
    fetchSecurityAssessment: () => ({
      data: { value: [] },
      error: { value: null },
      isFetching: { value: false },
      suspense: vi.fn(),
    }),
  },
}));

const CARD = 'lfx-project-docs-readiness-card-stub';

const render = () => shallowMount(SecurityView, { global: { renderStubDefaultSlot: true } });

describe('security.vue docs readiness card', () => {
  beforeEach(() => {
    mocks.loading.value = false;
    mocks.project.value = { slug: 'kubernetes', isLF: true, connectedPlatforms: ['github'] };
  });

  test('renders the card for an LF project', () => {
    expect(render().find(CARD).exists()).toBe(true);
  });

  test('hides the card for a non-LF project', () => {
    mocks.project.value = { slug: 'kubernetes', isLF: false, connectedPlatforms: ['github'] };
    expect(render().find(CARD).exists()).toBe(false);
  });

  test('hides the card while the next project loads over a stale LF project', () => {
    mocks.loading.value = true;
    expect(render().find(CARD).exists()).toBe(false);
  });

  test('hides the card while the project is not loaded', () => {
    mocks.project.value = undefined;
    expect(render().find(CARD).exists()).toBe(false);
  });

  test('renders the card for an LF project with no GitHub connection', () => {
    mocks.project.value = { slug: 'kubernetes', isLF: true, connectedPlatforms: [] };
    const wrapper = render();

    expect(wrapper.find(CARD).exists()).toBe(true);
    expect(wrapper.find('lfx-project-security-control-assessment-head-stub').exists()).toBe(false);
  });

  test('places the card after controls assessment and before vulnerabilities', () => {
    const html = render().html();
    const controls = html.indexOf('lfx-project-security-control-assessment-head-stub');
    const card = html.indexOf(CARD);
    const vulnerabilities = html.indexOf('lfx-project-vulnerabilities-section-stub');

    expect(controls).toBeGreaterThan(-1);
    expect(card).toBeGreaterThan(controls);
    expect(vulnerabilities).toBeGreaterThan(card);
  });
});
