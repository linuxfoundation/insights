// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';

import { DOCS_READINESS_API_SERVICE } from '~/components/modules/project/services/docs-readiness.api.service';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

import DocsReadinessTile from './docs-readiness-tile.vue';

const routeState = vi.hoisted(() => ({
  value: { params: {} as Record<string, string>, query: {} as Record<string, string> },
}));
const projectState = vi.hoisted(() => ({
  group: { value: null as unknown },
}));
const openCorrection = vi.hoisted(() => vi.fn());

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRoute: vi.fn(() => routeState.value),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: vi.fn(() => ({
    project: { value: { slug: 'test-project', name: 'Test Project', isLF: true } },
    selectedRepositoryGroup: projectState.group,
  })),
}));

vi.mock('~/components/modules/project/store/docs-readiness-correction.store', () => ({
  useDocsReadinessCorrectionStore: vi.fn(() => ({ openCorrection })),
}));

vi.mock('~/components/modules/project/services/docs-readiness.api.service', () => ({
  DOCS_READINESS_API_SERVICE: { fetchSummary: vi.fn() },
}));

const baseSummary: DocsReadinessSummary = {
  state: 'scored',
  score: 45,
  median: { value: 50, delta: 5, direction: 'below' },
  docsUrl: 'https://docs.example.com',
  repoUrl: null,
  isOverride: false,
  discovery: null,
  confidence: null,
  lastEvaluated: null,
  resultDate: null,
  nextEvaluation: null,
  biggestGap: { key: 'discoverability', name: 'Content discoverability', earned: 0, weight: 30 },
};

const mockSummary = (
  overrides: Partial<DocsReadinessSummary> = {},
  isPending = false,
  hasData = true,
) => {
  vi.mocked(DOCS_READINESS_API_SERVICE.fetchSummary).mockReturnValue({
    data: ref(hasData ? { ...baseSummary, ...overrides } : undefined),
    isPending: ref(isPending),
  } as never);
};

const mountTile = () =>
  mount(DocsReadinessTile, {
    global: {
      stubs: {
        NuxtLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' },
        LfxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        LfxSkeleton: { template: '<div data-testid="skeleton" />' },
        LfxIcon: { template: '<i />' },
      },
    },
  });

const emptyCases = [
  [
    'confirmed-no-docs',
    'No documentation site',
    'The LF team confirmed this project has no documentation website.',
  ],
  ['not-evaluated', 'Not evaluated yet', 'New projects are evaluated within a day.'],
  [
    'failed',
    'Evaluation failed',
    'We couldn’t evaluate this documentation site. We’ll retry tomorrow.',
  ],
] as const;

describe('docs-readiness-tile.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeState.value = { params: { slug: 'test-project' }, query: { repos: 'a', widget: 'stars' } };
    projectState.group = { value: null };
    mockSummary();
  });

  test('shows the skeleton and no heading while loading', () => {
    mockSummary({}, true, false);
    const wrapper = mountTile();
    expect(wrapper.find('[data-testid="skeleton"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('AI docs readiness');
  });

  test('scored: shows score, median sentence, biggest gap and View breakdown', () => {
    const wrapper = mountTile();
    const text = wrapper.text();
    expect(wrapper.find('p.whitespace-nowrap').text().replace(/\s+/g, ' ')).toBe('45 / 100');
    expect(text).toContain('5 points below the LF median (50)');
    expect(text.replace(/\s+/g, ' ')).toContain(
      'Biggest gap: Content discoverability · 0 of 30 pts',
    );
    expect(text).toContain('View breakdown');
  });

  test('scored: bar has aria-label, values and the marker at the median', () => {
    const wrapper = mountTile();
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe(
      'Score 45 of 100; LF median 50',
    );
    expect(wrapper.findComponent({ name: 'LfxProgressBar' }).props('values')).toEqual([45]);
    expect(
      wrapper.find('[data-testid="docs-readiness-median-marker"]').attributes('style'),
    ).toContain('left: 50%');
  });

  test('scored: singular "1 point above the LF median (50)"', () => {
    mockSummary({ score: 51, median: { value: 50, delta: 1, direction: 'above' } });
    expect(mountTile().text()).toContain('1 point above the LF median (50)');
  });

  test('scored: "At the LF median (50)" when direction is equal', () => {
    mockSummary({ score: 50, median: { value: 50, delta: 0, direction: 'equal' } });
    expect(mountTile().text()).toContain('At the LF median (50)');
  });

  test('scored: half-point median prints 5.5 points and places the marker at 50.5%', () => {
    mockSummary({ score: 45, median: { value: 50.5, delta: 5.5, direction: 'below' } });
    const wrapper = mountTile();
    expect(wrapper.text()).toContain('5.5 points below the LF median (50.5)');
    expect(
      wrapper.find('[data-testid="docs-readiness-median-marker"]').attributes('style'),
    ).toContain('left: 50.5%');
  });

  test.each([20, 79, 80, 97])('scored: bar colour is normal for score %i', (score) => {
    mockSummary({ score });
    expect(mountTile().findComponent({ name: 'LfxProgressBar' }).props('color')).toBe('normal');
  });

  test('scored: no median sentence, marker or aria median when median is null', () => {
    mockSummary({ median: null });
    const wrapper = mountTile();
    expect(wrapper.text()).not.toContain('LF median');
    expect(wrapper.find('[data-testid="docs-readiness-median-marker"]').exists()).toBe(false);
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Score 45 of 100');
  });

  test('scored: no biggest-gap line when biggestGap is null', () => {
    mockSummary({ biggestGap: null });
    expect(mountTile().text()).not.toContain('Biggest gap');
  });

  test('scored: score 0 renders "0" and an empty bar', () => {
    mockSummary({ score: 0 });
    const wrapper = mountTile();
    expect(wrapper.find('p.whitespace-nowrap').text().replace(/\s+/g, ' ')).toBe('0 / 100');
    expect(wrapper.findComponent({ name: 'LfxProgressBar' }).props('values')).toEqual([0]);
  });

  test('latest-failed: renders like scored with no failure text', () => {
    mockSummary({ state: 'latest-failed', score: 62 });
    const text = mountTile().text();
    expect(text).toContain('62');
    expect(text).toContain('View breakdown');
    expect(text).not.toContain('Evaluation failed');
  });

  test.each(['no-docs', 'repo-only'] as const)(
    '%s: shows Suggest and opens the correction flow',
    async (state) => {
      mockSummary({ state, score: null, median: null, docsUrl: null, biggestGap: null });
      const wrapper = mountTile();
      expect(wrapper.text()).toContain('Suggest a documentation URL');
      expect(wrapper.text()).not.toContain('View breakdown');
      await wrapper.find('button').trigger('click');
      expect(openCorrection).toHaveBeenCalledWith({
        projectSlug: 'test-project',
        projectName: 'Test Project',
        currentDocsUrl: null,
        state,
      });
    },
  );

  test('no-docs and repo-only show their copy', () => {
    mockSummary({ state: 'no-docs', score: null });
    expect(mountTile().text()).toContain('No documentation site found');
    mockSummary({ state: 'repo-only', score: null });
    expect(mountTile().text()).toContain('Docs live in the code repository');
  });

  test.each(emptyCases)(
    '%s: title and body, no Suggest, no View breakdown',
    (state, title, body) => {
      mockSummary({ state, score: null, median: null, biggestGap: null });
      const text = mountTile().text();
      expect(text).toContain(title);
      expect(text).toContain(body);
      expect(text).not.toContain('Suggest a documentation URL');
      expect(text).not.toContain('View breakdown');
    },
  );

  test('empty states show no score, bar or biggest gap', () => {
    mockSummary({ state: 'no-docs', score: null, median: null, biggestGap: null });
    const wrapper = mountTile();
    expect(wrapper.text()).not.toContain('/ 100');
    expect(wrapper.findComponent({ name: 'LfxProgressBar' }).exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Biggest gap');
  });

  test('renders nothing when the request fails', () => {
    mockSummary({}, false, false);
    expect(mountTile().find('[data-testid="docs-readiness-tile"]').exists()).toBe(false);
  });

  test('renders nothing for a scored state with a null score', () => {
    mockSummary({ state: 'scored', score: null });
    expect(mountTile().find('[data-testid="docs-readiness-tile"]').exists()).toBe(false);
  });

  test('renders nothing for a state it does not know', () => {
    mockSummary({ state: 'scored-v2' as never, score: null });
    expect(mountTile().find('[data-testid="docs-readiness-tile"]').exists()).toBe(false);
  });

  test.each([
    ['project', {}, null, LfxRoutes.PROJECT_SECURITY],
    ['repository', { name: 'repo' }, null, LfxRoutes.REPOSITORY_SECURITY],
    ['repository group', {}, { slug: 'g' }, LfxRoutes.REPOSITORY_GROUP_SECURITY],
  ])(
    'View breakdown targets the %s security route with the hash',
    (_label, params, group, name) => {
      routeState.value = {
        params: { slug: 'test-project', ...params },
        query: { repos: 'a', widget: 'stars' },
      };
      projectState.group = { value: group };
      const to = JSON.parse(mountTile().find('a').attributes('data-to') as string);
      expect(to.name).toBe(name);
      expect(to.hash).toBe('#docs-readiness');
      expect(to.query).toEqual({ repos: 'a' });
    },
  );

  test('fetches the summary once with the route slug', () => {
    mountTile();
    expect(DOCS_READINESS_API_SERVICE.fetchSummary).toHaveBeenCalledTimes(1);
    const slugArg = vi.mocked(DOCS_READINESS_API_SERVICE.fetchSummary).mock.calls[0]![0];
    expect(slugArg.value).toBe('test-project');
  });

  test('shows the Experimental tag and never a grade', () => {
    const text = mountTile().text();
    expect(text).toContain('Experimental');
    expect(text).not.toMatch(/grade|agent-ready/i);
    // no standalone letter grade (A-F) anywhere in the tile
    expect(text.split(/\s+/)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^[A-F]$/)]),
    );
  });
});
