// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import type { Project } from '~~/types/project';

import ProjectMenu from './project-menu.vue';

const mocks = await vi.hoisted(async () => {
  const { ref: vueRef } = await import('vue');
  return { enabled: vueRef(true) };
});

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRoute: vi.fn(() => ({ params: { slug: 'kubernetes' }, query: {}, name: 'project-slug' })),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~/components/modules/auth/store/auth.store', () => ({
  useAuthStore: () => ({ user: { value: null } }),
}));

vi.mock('~~/app/components/modules/project/store/project.store', () => ({
  useProjectStore: () => ({
    selectedRepositoryGroup: { value: undefined },
    selectedReposValues: { value: [] },
    startDate: { value: null },
    endDate: { value: null },
  }),
}));

vi.mock('~/components/modules/widget/composables/usePopularityExcludedWidgets', () => ({
  usePopularityExcludedWidgets: () => ({ excludedWidgets: ref([]) }),
}));

vi.mock('~/components/modules/project/services/community.api.service', () => ({
  PROJECT_COMMUNITY_API_SERVICE: { isCommunityEnabled: () => false },
}));

vi.mock('~~/composables/useDocsReadinessEnabled', () => ({
  useDocsReadinessEnabled: () => mocks.enabled,
}));

const project = (overrides: Partial<Project> = {}) =>
  ({
    slug: 'kubernetes',
    isLF: true,
    connectedPlatforms: [],
    lastVulnerabilityScanStatus: null,
    widgets: [],
    ...overrides,
  }) as unknown as Project;

const render = (value: Project) =>
  mount(ProjectMenu, {
    props: { project: value },
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        LfxDropdown: { template: '<div><slot /></div>' },
        LfxDropdownItem: { template: '<div />' },
        LfxDropdownSelector: { template: '<div />' },
        LfxMenuButton: { template: '<span data-menu><slot /></span>' },
        LfxTooltip: { template: '<div><slot /></div>' },
        LfxSkeletonState: { template: '<div />' },
      },
    },
  });

const menuLabels = (value: Project) =>
  render(value)
    .findAll('[data-menu]')
    .map((item) => item.text());

describe('project-menu.vue Security tab', () => {
  beforeEach(() => {
    mocks.enabled.value = true;
  });

  test('lists Security for an LF project with no GitHub or scan when the flag is on', () => {
    expect(menuLabels(project()).some((label) => label.includes('Security'))).toBe(true);
  });

  test('does not list Security for that project when the flag is off', () => {
    mocks.enabled.value = false;
    expect(menuLabels(project()).some((label) => label.includes('Security'))).toBe(false);
  });

  test('does not list Security for a non-LF project when the flag is on', () => {
    expect(menuLabels(project({ isLF: false })).some((label) => label.includes('Security'))).toBe(
      false,
    );
  });

  test('keeps listing Security for a GitHub project with the flag off', () => {
    mocks.enabled.value = false;
    expect(
      menuLabels(project({ connectedPlatforms: ['github'] })).some((label) =>
        label.includes('Security'),
      ),
    ).toBe(true);
  });
});
