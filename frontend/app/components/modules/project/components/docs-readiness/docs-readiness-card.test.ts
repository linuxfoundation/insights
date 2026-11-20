// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { enableAutoUnmount, flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, test, expect, vi, beforeEach } from 'vitest';
import { nextTick, ref } from 'vue';

import LfxProjectDocsReadinessCard from './docs-readiness-card.vue';
import { checksFixture, historyFixture, summaryFixture } from './docs-readiness-fixtures';

const mocks = await vi.hoisted(async () => {
  const { reactive, ref: vueRef } = await import('vue');
  return {
    project: vueRef<{ slug: string; name: string; isLF: boolean } | undefined>(),
    selectedReposValues: vueRef<string[]>([]),
    openCorrection: vi.fn(),
    fetchSummary: vi.fn(),
    fetchHistory: vi.fn(),
    fetchChecks: vi.fn(),
    fetchCorrectionContext: vi.fn(),
    route: reactive({ path: '/project/kubernetes/security', hash: '' }),
    beforeEach: vi.fn(),
    fetchingCount: vueRef(0),
    scrollToTarget: vi.fn(),
  };
});

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRoute: () => mocks.route,
  useRouter: () => ({ beforeEach: mocks.beforeEach }),
}));

vi.mock('@tanstack/vue-query', () => ({ useIsFetching: () => mocks.fetchingCount }));

vi.mock('~/components/shared/utils/scroll', () => ({
  default: () => ({ scrollToTarget: mocks.scrollToTarget }),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: () => ({
    project: mocks.project,
    selectedReposValues: mocks.selectedReposValues,
  }),
}));

vi.mock('~/components/modules/project/store/docs-readiness-correction.store', () => ({
  useDocsReadinessCorrectionStore: () => ({ openCorrection: mocks.openCorrection }),
}));

vi.mock('~/components/modules/project/services/docs-readiness.api.service', () => ({
  DOCS_READINESS_API_SERVICE: {
    fetchSummary: mocks.fetchSummary,
    fetchHistory: mocks.fetchHistory,
    fetchChecks: mocks.fetchChecks,
    fetchCorrectionContext: mocks.fetchCorrectionContext,
  },
}));

vi.mock(
  '~/components/modules/project/components/overview/trust-score/health-score-ring.vue',
  () => ({
    default: {
      name: 'LfxHealthScoreRing',
      props: ['score', 'color'],
      template: '<div data-testid="ring" :data-score="score" :data-color="color" />',
    },
  }),
);

vi.mock('~/components/uikit/button/button.vue', () => ({
  default: {
    name: 'LfxButton',
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
}));

vi.mock('~/components/uikit/tooltip/tooltip.vue', () => ({
  default: {
    name: 'LfxTooltip',
    props: ['content', 'disabled'],
    template: '<span><slot /><span data-tip>{{ content }}</span></span>',
  },
}));

vi.mock('~/components/uikit/skeleton/skeleton.vue', () => ({
  default: { name: 'LfxSkeleton', template: '<div data-testid="skeleton" />' },
}));

const query = (data: unknown, extra: Record<string, unknown> = {}) => ({
  data: ref(data),
  isPending: ref(false),
  isError: ref(false),
  suspense: vi.fn(),
  ...extra,
});

interface Setup {
  summary?: unknown;
  history?: unknown;
  checks?: unknown;
  context?: unknown;
}

const setup = ({
  summary,
  history = historyFixture(),
  checks = checksFixture(),
  context,
}: Setup = {}) => {
  const queries = {
    summary: query(summary ?? summaryFixture()),
    history: query(history),
    checks: query(checks),
    context: query(context),
  };
  mocks.fetchSummary.mockReturnValue(queries.summary);
  mocks.fetchHistory.mockReturnValue(queries.history);
  mocks.fetchChecks.mockReturnValue(queries.checks);
  mocks.fetchCorrectionContext.mockReturnValue(queries.context);
  return queries;
};

const render = () => mount(LfxProjectDocsReadinessCard);

const clickButton = async (wrapper: VueWrapper, text: string) => {
  const button = wrapper.findAll('button').find((b) => b.text().includes(text));
  expect(button, `button "${text}"`).toBeTruthy();
  await button!.trigger('click');
};

describe('docs-readiness-card.vue', () => {
  enableAutoUnmount(afterEach);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.project.value = { slug: 'kubernetes', name: 'Kubernetes', isLF: true };
    mocks.selectedReposValues.value = [];
    // A fresh path per test, since the landed target is kept at module scope
    mocks.route.path = `/project/kubernetes/security/${Math.random()}`;
    mocks.route.hash = '';
    mocks.beforeEach.mockReturnValue(vi.fn());
    mocks.fetchingCount.value = 0;
  });

  test('scored: ring, median line, counts, URL row with chips, dates, history', () => {
    setup();
    const wrapper = render();
    const text = wrapper.text();

    expect(wrapper.get('[data-testid="ring"]').attributes('data-score')).toBe('45');
    expect(text).toContain('5 points below the LF project median of 50');
    expect(text).toContain('7 passed');
    expect(text).toContain('2 need attention');
    expect(text).toContain('5 failed');
    expect(text).toContain('9 skipped');
    expect(text).toContain('docs.kubernetes.io');
    expect(text).toContain('Found at a docs subdomain');
    expect(text).toContain('High confidence');
    expect(text).toContain('Last evaluated');
    expect(text).toContain('Nov 1, 2026');
    expect(text).toContain('Dec 1, 2026 · monthly');
    expect(wrapper.findAll('[data-testid="history-bar"]')).toHaveLength(3);
    expect(wrapper.get('#docs-readiness').classes()).toContain('scroll-mt-[220px]');
  });

  test('scored: shows the confidence tooltip text', () => {
    setup();
    expect(render().get('[data-tip]').text()).toBe('Found at a conventional docs location');
  });

  test('scored with an override: variant copy, Set on date, no method or confidence chip', () => {
    setup({
      summary: summaryFixture({ isOverride: true }),
      context: {
        override: {
          docsUrl: 'https://docs.kubernetes.io/',
          submittedAt: '2026-03-04T10:00:00.000Z',
        },
      },
    });
    const text = render().text();

    expect(text).toContain('Confirmed by LF team');
    expect(text).toContain('Set on Mar 4, 2026.');
    expect(text).toContain('This URL takes priority over automatic discovery.');
    expect(text).toContain('Still wrong? Request another correction');
    expect(text).not.toContain('Found at a docs subdomain');
    expect(text).not.toContain('High confidence');
  });

  test.each([
    ['the override is null', { override: null }],
    ['the context has no data', undefined],
  ])('override without a submitted date when %s: variant shown, no "Set on"', (_name, context) => {
    setup({ summary: summaryFixture({ isOverride: true }), context });
    const text = render().text();

    expect(text).toContain('Confirmed by LF team');
    expect(text).toContain('This URL takes priority over automatic discovery.');
    expect(text).not.toContain('Set on');
  });

  test('does not request the correction context when the URL is not an override', () => {
    setup();
    render();
    const enabled = mocks.fetchCorrectionContext.mock.calls[0]![1];
    expect(enabled.value).toBe(false);
  });

  test('requests the correction context when the URL is an override', () => {
    setup({ summary: summaryFixture({ isOverride: true }) });
    render();
    expect(mocks.fetchCorrectionContext.mock.calls[0]![1].value).toBe(true);
  });

  test('latest-failed: banner with both dates, earlier score, "(failed)", "Retrying daily"', () => {
    setup({
      summary: summaryFixture({
        state: 'latest-failed',
        lastEvaluated: { date: '2026-11-01', failed: true },
        resultDate: '2026-10-01',
        nextEvaluation: { at: null, retryingDaily: true },
      }),
    });
    const wrapper = render();
    const text = wrapper.text();

    expect(wrapper.get('[role="status"]').text()).toBe(
      'The evaluation on Nov 1, 2026 couldn’t complete. Showing results from Oct 1, 2026.',
    );
    expect(wrapper.get('[data-testid="ring"]').attributes('data-score')).toBe('45');
    expect(text).toContain('Nov 1, 2026 (failed)');
    expect(text).toContain('Retrying daily');
  });

  test('latest-failed without checks: score and URL row shown, counts and pages line hidden', () => {
    setup({
      summary: summaryFixture({
        state: 'latest-failed',
        lastEvaluated: { date: '2026-11-01', failed: true },
      }),
      checks: checksFixture({ categories: [] }),
    });
    const wrapper = render();
    const text = wrapper.text();

    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(true);
    expect(text).toContain('docs.kubernetes.io');
    expect(text).not.toContain('passed');
    expect(text).not.toContain('page tested');
  });

  test('failed: banner, no ring, URL row, dashed Failed slot, "Retrying daily"', () => {
    setup({
      summary: summaryFixture({
        state: 'failed',
        score: null,
        median: null,
        lastEvaluated: { date: '2026-11-01', failed: true },
        nextEvaluation: { at: null, retryingDaily: true },
      }),
      history: {
        firstEvaluatedMonth: '2026-11-01',
        months: [
          {
            month: '2026-11-01',
            score: null,
            failed: true,
            docsUrl: 'https://docs.kubernetes.io/',
            urlChanged: false,
          },
        ],
      },
    });
    const wrapper = render();
    const text = wrapper.text();

    expect(wrapper.get('[role="status"]').text()).toContain(
      'We couldn’t evaluate this documentation site.',
    );
    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(false);
    expect(text).toContain('docs.kubernetes.io');
    expect(wrapper.find('[data-testid="history-failed-slot"]').exists()).toBe(true);
    expect(text).toContain('Retrying daily');
    expect(text).not.toContain('page tested');
  });

  test('no-docs: copy and action; no URL row, no history; dates shown', () => {
    setup({
      summary: summaryFixture({
        state: 'no-docs',
        score: null,
        median: null,
        docsUrl: null,
        discovery: null,
        confidence: null,
      }),
    });
    const wrapper = render();
    const text = wrapper.text();

    expect(text).toContain('We couldn’t find a documentation site for this project');
    expect(text).toContain('Suggest a documentation URL');
    expect(text).not.toContain('Evaluated documentation');
    expect(wrapper.find('[data-testid="history-chart"]').exists()).toBe(false);
    expect(text).toContain('Last evaluated');
  });

  test('confirmed-no-docs: copy and "Request a correction"', () => {
    setup({
      summary: summaryFixture({
        state: 'confirmed-no-docs',
        score: null,
        median: null,
        docsUrl: null,
      }),
    });
    const text = render().text();

    expect(text).toContain('This project doesn’t publish a documentation site');
    expect(text).toContain('Docs published since? Request a correction');
  });

  test('repo-only: body names the repository; "Suggest a documentation website"', () => {
    setup({
      summary: summaryFixture({ state: 'repo-only', score: null, median: null, docsUrl: null }),
    });
    const text = render().text();

    expect(text).toContain('github.com/kubernetes/kubernetes isn’t scored.');
    expect(text).toContain('Suggest a documentation website');
  });

  test('not-evaluated: copy only, no action, no dates', () => {
    setup({
      summary: summaryFixture({
        state: 'not-evaluated',
        score: null,
        median: null,
        docsUrl: null,
        lastEvaluated: null,
        nextEvaluation: null,
      }),
    });
    const wrapper = render();

    expect(wrapper.text()).toContain('Not evaluated yet');
    expect(wrapper.findAll('button')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Last evaluated');
  });

  test('shows the repository note only when repositories are selected', () => {
    setup();
    expect(render().text()).not.toContain('not per repository');

    mocks.selectedReposValues.value = ['https://github.com/kubernetes/kubernetes'];
    expect(render().text()).toContain(
      "Assessed for the project's documentation site, not per repository.",
    );
  });

  test.each([
    ['scored', {}, 'Wrong URL? Request a correction', 'https://docs.kubernetes.io/', 'scored'],
    [
      'latest-failed',
      { state: 'latest-failed', lastEvaluated: { date: '2026-11-01', failed: true } },
      'Request a correction',
      'https://docs.kubernetes.io/',
      'latest-failed',
    ],
    [
      'failed',
      { state: 'failed', score: null, lastEvaluated: { date: '2026-11-01', failed: true } },
      'Request a correction',
      'https://docs.kubernetes.io/',
      'failed',
    ],
    [
      'override',
      { isOverride: true },
      'Request another correction',
      'https://docs.kubernetes.io/',
      'scored',
    ],
    [
      'no-docs',
      { state: 'no-docs', score: null, docsUrl: null },
      'Suggest a documentation URL',
      null,
      'no-docs',
    ],
    [
      'repo-only',
      { state: 'repo-only', score: null, docsUrl: null },
      'Suggest a documentation website',
      null,
      'repo-only',
    ],
    [
      'confirmed-no-docs',
      { state: 'confirmed-no-docs', score: null, docsUrl: null },
      'Request a correction',
      null,
      'confirmed-no-docs',
    ],
  ])(
    'correction control (%s) opens the modal with the project and state',
    async (_name, overrides, label, docsUrl, state) => {
      setup({ summary: summaryFixture(overrides as never) });
      const wrapper = render();

      await clickButton(wrapper, label);
      expect(wrapper.findAll('button').filter((b) => b.text() === label)).toHaveLength(1);

      expect(mocks.openCorrection).toHaveBeenCalledTimes(1);
      expect(mocks.openCorrection).toHaveBeenCalledWith({
        projectSlug: 'kubernetes',
        projectName: 'Kubernetes',
        currentDocsUrl: docsUrl,
        state,
      });
    },
  );

  test('shows skeletons while the summary loads', () => {
    const queries = setup();
    queries.summary.isPending.value = true;
    queries.summary.data.value = undefined;
    const wrapper = render();

    expect(wrapper.findAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('isn’t available');
  });

  test.each([
    ['scored without a score', { score: null }],
    [
      'latest-failed without a score',
      { state: 'latest-failed', score: null, lastEvaluated: { date: '2026-11-01', failed: true } },
    ],
    [
      'failed without a URL',
      {
        state: 'failed',
        score: null,
        docsUrl: null,
        lastEvaluated: { date: '2026-11-01', failed: true },
      },
    ],
  ])('shows only the unavailable message for %s: no banner, no aside', (_name, overrides) => {
    setup({ summary: summaryFixture(overrides as never) });
    const wrapper = render();

    expect(wrapper.text()).toContain('AI documentation readiness isn’t available right now.');
    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(false);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="history-chart"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Last evaluated');
  });

  test('scrolls to the card once loading settles when the URL hash targets it', async () => {
    mocks.route.hash = '#docs-readiness';
    mocks.fetchingCount.value = 1;
    setup();
    const wrapper = mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
    await nextTick();
    expect(mocks.scrollToTarget).not.toHaveBeenCalled();

    mocks.fetchingCount.value = 0;
    await flushPromises();
    expect(mocks.scrollToTarget).toHaveBeenCalledWith(
      document.getElementById('docs-readiness'),
      undefined,
      'instant',
    );
    wrapper.unmount();
  });

  const landOnCard = async () => {
    mocks.route.hash = '#docs-readiness';
    setup();
    const wrapper = mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
    await flushPromises();
    return wrapper;
  };

  const settleFetch = async () => {
    mocks.fetchingCount.value = 1;
    await nextTick();
    mocks.fetchingCount.value = 0;
    await flushPromises();
  };

  test('does not re-scroll on a later fetch settle after the first landing', async () => {
    const wrapper = await landOnCard();
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(1);

    await settleFetch();
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  test.each([['wheel'], ['pointerdown'], ['mousedown'], ['keydown'], ['touchmove']])(
    'a %s before content settles stops the re-scroll',
    async (event) => {
      mocks.route.hash = '#docs-readiness';
      mocks.fetchingCount.value = 1;
      setup();
      const wrapper = mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
      await nextTick();

      window.dispatchEvent(new Event(event));
      mocks.fetchingCount.value = 0;
      await flushPromises();
      expect(mocks.scrollToTarget).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );

  const navigate = (to: { path: string; hash: string }) => {
    const guard = mocks.beforeEach.mock.calls.at(-1)![0];
    guard(to, { path: mocks.route.path, hash: mocks.route.hash });
  };

  test('re-arms when the hash targets the card again', async () => {
    await landOnCard();
    navigate({ path: mocks.route.path, hash: '' });
    mocks.route.hash = '';
    await flushPromises();
    navigate({ path: mocks.route.path, hash: '#docs-readiness' });
    mocks.route.hash = '#docs-readiness';
    await flushPromises();
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(2);
  });

  test('a remount from a query change does not land again', async () => {
    const first = await landOnCard();
    navigate({ path: mocks.route.path, hash: mocks.route.hash });
    first.unmount();

    mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
    await flushPromises();
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(1);
  });

  test('a remount after leaving the page lands again', async () => {
    const first = await landOnCard();
    navigate({ path: '/project/kubernetes', hash: '' });
    first.unmount();

    mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
    await flushPromises();
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(2);
  });

  test('going back to a left entry restores its position instead of landing', async () => {
    const first = await landOnCard();
    navigate({ path: '/project/kubernetes/contributors', hash: '' });
    first.unmount();

    window.history.replaceState({ scroll: { left: 0, top: 400 } }, '');
    mount(LfxProjectDocsReadinessCard, { attachTo: document.body });
    await flushPromises();
    window.history.replaceState(null, '');
    expect(mocks.scrollToTarget).toHaveBeenCalledTimes(1);
  });

  test('removes the input listeners on unmount', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const wrapper = await landOnCard();
    wrapper.unmount();

    const removeGuard = mocks.beforeEach.mock.results.at(-1)!.value;
    const removed = remove.mock.calls.map(([event]) => event);
    expect(removeGuard).toHaveBeenCalledTimes(1);
    expect(removed).toEqual(
      expect.arrayContaining(['wheel', 'touchmove', 'keydown', 'pointerdown', 'mousedown']),
    );
    remove.mockRestore();
  });

  test('does not scroll without the hash', async () => {
    setup();
    render();
    await flushPromises();
    expect(mocks.scrollToTarget).not.toHaveBeenCalled();
  });

  test('shows the unavailable message when the summary fails', () => {
    const queries = setup();
    queries.summary.isError.value = true;
    queries.summary.data.value = undefined;
    const wrapper = render();

    expect(wrapper.text()).toContain('AI documentation readiness isn’t available right now.');
    expect(wrapper.find('[data-testid="history-chart"]').exists()).toBe(false);
  });

  test('history failure hides the chart and keeps the rest', () => {
    const queries = setup();
    queries.history.isError.value = true;
    queries.history.data.value = undefined;
    const wrapper = render();

    expect(wrapper.find('[data-testid="history-chart"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Last evaluated');
  });

  test('checks failure hides counts and the pages line and keeps the score', () => {
    const queries = setup();
    queries.checks.isError.value = true;
    queries.checks.data.value = undefined;
    const wrapper = render();

    expect(wrapper.find('[data-testid="ring"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('passed');
    expect(wrapper.text()).not.toContain('page tested');
  });

  test('header: Experimental tag and "How we score this" opening the docs URL in a new tab', () => {
    setup();
    const wrapper = render();
    const link = wrapper.get(
      'a[href="https://insights.linuxfoundation.org/docs/features/ai-documentation-readiness"]',
    );

    expect(wrapper.text()).toContain('Experimental');
    expect(link.text()).toBe('How we score this');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
  });

  test('shows the one-page note in Evaluated documentation', () => {
    setup();
    expect(render().text()).toContain(
      'Based on 1 page tested. Only the docs landing page could be tested',
    );
  });

  test.each([['scored'], ['latest-failed']])('never renders a grade (%s)', (state) => {
    setup({ summary: summaryFixture({ state: state as never }) });
    const text = render().text();

    expect(text).not.toContain('Grade');
    expect(text).not.toContain('agent-ready');
    expect(text).not.toContain('Grading scale');
  });

  test.each([
    ['without an override', false, 0],
    ['with an override', true, 1],
  ])('server prefetch waits for the context only %s', async (_name, isOverride, contextCalls) => {
    const queries = setup({ summary: summaryFixture({ isOverride }) });

    // Nuxt strips onServerPrefetch calls in the test env, so run the registered function directly
    await (render().vm as unknown as { prefetch: () => Promise<void> }).prefetch();

    expect(queries.summary.suspense).toHaveBeenCalledTimes(1);
    expect(queries.history.suspense).toHaveBeenCalledTimes(1);
    expect(queries.checks.suspense).toHaveBeenCalledTimes(1);
    expect(queries.context.suspense).toHaveBeenCalledTimes(contextCalls);
  });
});
