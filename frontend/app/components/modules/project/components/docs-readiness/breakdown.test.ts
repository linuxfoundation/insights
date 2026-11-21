// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  DocsReadinessCategory,
  DocsReadinessCheck,
} from '~~/types/docs-readiness/readiness.types';

import LfxProjectDocsReadinessBreakdown from './breakdown.vue';

vi.mock('~/components/uikit/chart/chart.vue', () => ({
  default: { name: 'LfxChart', template: '<div data-test="ring" />' },
}));

vi.mock('~/components/uikit/icon/icon.vue', () => ({
  default: { name: 'LfxIcon', props: ['name'], template: '<i :data-icon="name" />' },
}));

vi.mock('~/components/uikit/button/button.vue', () => ({
  default: {
    name: 'LfxButton',
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
}));

const check = (overrides: Partial<DocsReadinessCheck> = {}): DocsReadinessCheck => ({
  id: 'llms-txt-exists',
  status: 'fail',
  message: 'stored message',
  skipReason: null,
  testedPages: 1,
  totalPages: 1,
  ...overrides,
});

const category = (overrides: Partial<DocsReadinessCategory> = {}): DocsReadinessCategory => ({
  key: 'content-discoverability',
  name: 'Content discoverability',
  description: 'Can agents find the docs',
  weight: 30,
  percent: 50,
  points: 15,
  notAssessed: false,
  passed: 1,
  applicable: 2,
  needsAttention: 0,
  checks: [check()],
  ...overrides,
});

const seven = () =>
  Array.from({ length: 7 }, (_, i) =>
    category({
      key: `cat-${i}`,
      name: `Category ${i}`,
      checks: [check({ id: `llms-txt-size`, message: `m${i}` })],
    }),
  );

const render = (categories: DocsReadinessCategory[]) =>
  mount(LfxProjectDocsReadinessBreakdown, { props: { categories } });

const headers = (wrapper: ReturnType<typeof render>) => wrapper.findAll('[role="button"]');

describe('breakdown.vue', () => {
  enableAutoUnmount(afterEach);

  it('renders nothing when categories is empty', () => {
    expect(render([]).find('section').exists()).toBe(false);
  });

  it('renders the title and subtitle', () => {
    const wrapper = render([category()]);
    expect(wrapper.get('h3').text()).toBe('Score breakdown');
    expect(wrapper.text()).toContain(
      'Each category earns points up to its weight. Skipped checks don’t count.',
    );
  });

  it('renders one row per category in the given order', () => {
    const names = render(seven())
      .findAll('h4')
      .map((h) => h.text());
    expect(names).toEqual(Array.from({ length: 7 }, (_, i) => `Category ${i}`));
  });

  it('the first category is expanded by default, the others collapsed', () => {
    const wrapper = render(seven());
    expect(headers(wrapper).map((h) => h.attributes('aria-expanded'))).toEqual([
      'true',
      ...Array(6).fill('false'),
    ]);
    expect(wrapper.findAll('li')).toHaveLength(1);
    expect(wrapper.findAll('article')[0]!.find('li').exists()).toBe(true);
  });

  it('every check appears under its stored category', () => {
    const wrapper = render([
      category({ key: 'a', name: 'A', checks: [check({ id: 'auth-gate-detection' })] }),
      category({ key: 'b', name: 'B', checks: [check({ id: 'llms-txt-valid' })] }),
    ]);
    const first = wrapper.findAll('article')[0]!;
    expect(first.text()).toContain('Docs are public');
    expect(first.text()).not.toContain('llms.txt follows the llmstxt.org structure');
  });

  it('shows percent in the ring label and "x of y checks passed"', () => {
    const wrapper = render([category({ percent: 50, passed: 1, applicable: 2 })]);
    expect(wrapper.get('[data-test="pct"]').text()).toBe('50%');
    expect(wrapper.get('[data-test="passed"]').text()).toBe('1 of 2 checks passed');
  });

  it('shows "1 needs attention" and "2 need attention"; hides the line at 0', () => {
    expect(
      render([category({ needsAttention: 1 })])
        .get('[data-test="warn"]')
        .text(),
    ).toBe('1 needs attention');
    expect(
      render([category({ needsAttention: 2 })])
        .get('[data-test="warn"]')
        .text(),
    ).toBe('2 need attention');
    expect(
      render([category({ needsAttention: 0 })])
        .find('[data-test="warn"]')
        .exists(),
    ).toBe(false);
  });

  it('shows "p / w pts"', () => {
    expect(
      render([category({ points: 15, weight: 30 })])
        .get('[data-test="points"]')
        .text(),
    ).toBe('15 / 30 pts');
  });

  it('not assessed: N/A, "Not assessed · full points", points still shown', () => {
    const wrapper = render([
      category({ notAssessed: true, percent: null, points: 10, weight: 10, checks: [] }),
    ]);
    expect(wrapper.get('[data-test="pct"]').text()).toBe('N/A');
    expect(wrapper.get('[data-test="passed"]').text()).toBe('Not assessed · full points');
    expect(wrapper.get('[data-test="points"]').text()).toBe('10 / 10 pts');
  });

  it('unknown category: raw key as name, no description, no points line, N/A when percent is null', () => {
    const wrapper = render([
      category({
        key: 'mystery',
        name: 'mystery',
        description: '',
        weight: null,
        points: null,
        percent: null,
      }),
    ]);
    expect(wrapper.get('h4').text()).toBe('mystery');
    expect(wrapper.find('p.text-neutral-500').exists()).toBe(false);
    expect(wrapper.find('[data-test="points"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="pct"]').text()).toBe('N/A');
  });

  it('clicking a collapsed category opens it and closes the open one', async () => {
    const wrapper = render(seven());
    await headers(wrapper)[1]!.trigger('click');
    expect(headers(wrapper).map((h) => h.attributes('aria-expanded'))).toEqual([
      'false',
      'true',
      ...Array(5).fill('false'),
    ]);
  });

  it('Enter and Space on a focused header toggle it', async () => {
    const wrapper = render(seven());
    await headers(wrapper)[1]!.trigger('keydown', { key: 'Enter' });
    expect(headers(wrapper)[1]!.attributes('aria-expanded')).toBe('true');
    await headers(wrapper)[1]!.trigger('keydown', { key: ' ' });
    expect(headers(wrapper)[1]!.attributes('aria-expanded')).toBe('false');
  });

  it('headers are focusable buttons', () => {
    headers(render(seven())).forEach((h) => {
      expect(h.attributes('role')).toBe('button');
      expect(h.attributes('tabindex')).toBe('0');
    });
  });

  it('a category with no checks opens without a list', () => {
    const wrapper = render([category({ checks: [] })]);
    expect(headers(wrapper)[0]!.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('ul').exists()).toBe(false);
  });
});
