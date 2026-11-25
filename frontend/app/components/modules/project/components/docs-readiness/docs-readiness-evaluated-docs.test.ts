// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, test, expect, vi } from 'vitest';

import LfxProjectDocsReadinessEvaluatedDocs from './docs-readiness-evaluated-docs.vue';
import { summaryFixture } from './docs-readiness-fixtures';

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
    template: '<span><slot /><span data-tip :data-disabled="disabled">{{ content }}</span></span>',
  },
}));

const render = (summary = summaryFixture(), pagesTested: number | null = null) =>
  mount(LfxProjectDocsReadinessEvaluatedDocs, { props: { summary, pagesTested, setOn: null } });

describe('docs-readiness-evaluated-docs.vue', () => {
  test.each([
    [
      1,
      'Based on 1 page tested. Only the docs landing page could be tested, so this score may not reflect the whole site.',
    ],
    [12, 'Based on 12 pages tested.'],
  ])('pages line for %s', (pagesTested, expected) => {
    expect(render(summaryFixture(), pagesTested).text()).toContain(expected);
  });

  test.each([[null], [0]])('no pages line for %s', (pagesTested) => {
    expect(render(summaryFixture(), pagesTested).text()).not.toContain('Based on');
  });

  test('renders a non-http URL as text, not a link', () => {
    const wrapper = render(summaryFixture({ docsUrl: 'javascript:alert(1)' }));
    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.text()).toContain('javascript:alert(1)');
  });

  test('link shows the URL without protocol or trailing slash and opens in a new tab', () => {
    const link = render().get('a');
    expect(link.text()).toBe('docs.kubernetes.io');
    expect(link.attributes('href')).toBe('https://docs.kubernetes.io/');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
  });

  test('omits a chip when discovery or confidence is null; tooltip disabled when its text is empty', () => {
    const none = render(summaryFixture({ discovery: null, confidence: null }));
    expect(none.text()).not.toContain('Found at');
    expect(none.find('[data-tip]').exists()).toBe(false);

    const empty = render(
      summaryFixture({ confidence: { level: 'low', label: 'Low confidence', tooltip: '' } }),
    );
    expect(empty.get('[data-tip]').attributes('data-disabled')).toBe('true');
  });

  test('emits correct when the button is clicked', async () => {
    const wrapper = render();
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('correct')).toHaveLength(1);
  });
});
