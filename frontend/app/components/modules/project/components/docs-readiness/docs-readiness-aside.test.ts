// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, test, expect, vi } from 'vitest';

import LfxProjectDocsReadinessAside from './docs-readiness-aside.vue';
import { historyFixture, summaryFixture } from './docs-readiness-fixtures';

vi.mock('~/components/uikit/tooltip/tooltip.vue', () => ({
  default: {
    name: 'LfxTooltip',
    props: ['content'],
    template: '<span><slot /><span data-tip>{{ content }}</span></span>',
  },
}));

const render = (history: unknown = historyFixture(), summary = summaryFixture()) =>
  mount(LfxProjectDocsReadinessAside, { props: { summary, history: history as never } });

describe('docs-readiness-aside.vue', () => {
  test('renders one bar per month with its score and height', () => {
    const wrapper = render();
    expect(wrapper.findAll('[data-testid="history-bar"]')).toHaveLength(3);
    expect(wrapper.get('[data-testid="history-fill"]').attributes('style')).toContain(
      'height: 50px',
    );
    expect(wrapper.get('[data-testid="history-bar"]').text()).toContain('45');
  });

  test('bars keep their height instead of shrinking in the column', () => {
    const wrapper = render();
    expect(wrapper.get('[data-testid="history-fill"]').classes()).toContain('shrink-0');
  });

  test('renders a failed-only month as a dashed slot labelled Failed', () => {
    const wrapper = render({
      firstEvaluatedMonth: '2026-11-01',
      months: [
        {
          month: '2026-11-01',
          score: null,
          failed: true,
          docsUrl: 'https://a.io/',
          urlChanged: false,
        },
      ],
    });
    expect(wrapper.find('[data-testid="history-failed-slot"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="history-failed-slot"]').classes()).toContain('shrink-0');
    expect(wrapper.find('[data-testid="history-fill"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="history-bar"]').text()).toContain('Failed');
  });

  test('skips a month with neither a score nor a failure', () => {
    const history = historyFixture();
    history.months.push({
      month: '2026-12-01',
      score: null,
      failed: false,
      docsUrl: 'https://a.io/',
      urlChanged: false,
    });
    expect(render(history).findAll('[data-testid="history-bar"]')).toHaveLength(3);
  });

  test('marks a month whose docs URL changed and names the new URL in the tooltip', () => {
    const history = historyFixture();
    history.months[1] = {
      ...history.months[1]!,
      urlChanged: true,
      docsUrl: 'https://new.example.org/docs/',
    };
    const wrapper = render(history);

    expect(wrapper.findAll('[data-testid="history-url-changed"]')).toHaveLength(1);
    expect(wrapper.get('[data-tip]').text()).toBe(
      'Documentation URL changed to new.example.org/docs',
    );
  });

  test('caption and footer copy', () => {
    const text = render().text();
    expect(text).toContain('Latest successful run each month');
    expect(text).toContain('First evaluated Sep 2026.');
  });

  test('aria label lists months, values and failures', () => {
    const history = historyFixture();
    history.months[1] = { ...history.months[1]!, urlChanged: true };
    history.months[2] = { ...history.months[2]!, score: null, failed: true };
    expect(render(history).get('[role="img"]').attributes('aria-label')).toBe(
      'Score history: Sep 45, Oct 45, docs URL changed, Nov Failed',
    );
  });

  test.each([['no-docs'], ['confirmed-no-docs'], ['repo-only'], ['not-evaluated']])(
    'hides the history for %s even when months exist',
    (state) => {
      expect(
        render(historyFixture(), summaryFixture({ state: state as never }))
          .find('[data-testid="history-chart"]')
          .exists(),
      ).toBe(false);
    },
  );

  test.each([
    ['null history', null],
    ['no months', { firstEvaluatedMonth: null, months: [] }],
  ])('hides the history for %s', (_name, history) => {
    expect(render(history).find('[data-testid="history-chart"]').exists()).toBe(false);
  });

  test('shows the dates and hides the dates block when there are none', () => {
    expect(render().text()).toContain('Last evaluated');
    const wrapper = render(null, summaryFixture({ lastEvaluated: null, nextEvaluation: null }));
    expect(wrapper.text()).not.toContain('Last evaluated');
    expect(wrapper.text()).not.toContain('Next evaluation');
  });
});
