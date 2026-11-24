// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  DocsReadinessCheck,
  DocsReadinessCheckStatus,
} from '~~/types/docs-readiness/readiness.types';

import LfxProjectDocsReadinessBreakdownCheck from './breakdown-check.vue';

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

const render = (overrides: Partial<DocsReadinessCheck> = {}) =>
  mount(LfxProjectDocsReadinessBreakdownCheck, { props: { check: check(overrides) } });

describe('breakdown-check.vue', () => {
  enableAutoUnmount(afterEach);

  it.each([
    ['fail', 'Failed', 'text-negative-700'],
    ['error', 'Couldn’t run', 'text-negative-700'],
    ['warn', 'Needs attention', 'text-warning-800'],
    ['pass', 'Passed', 'text-positive-700'],
    ['skip', 'Skipped', 'text-neutral-500'],
  ] as [DocsReadinessCheckStatus, string, string][])(
    'renders the label in its colour, with no icon, for %s',
    (status, label, cls) => {
      const status$ = render({ status }).get('[data-test="status"]');
      expect(status$.text()).toBe(label);
      expect(status$.find('i').exists()).toBe(false);
      expect(status$.classes()).toContain(cls);
    },
  );

  it('shows the copy title for a known check', () => {
    expect(render().get('[data-test="title"]').text()).toBe('An llms.txt file is published');
  });

  it('shows the raw id as the title for an unknown check', () => {
    expect(render({ id: 'brand-new-check' }).get('[data-test="title"]').text()).toBe(
      'brand-new-check',
    );
  });

  it('shows the stored message word for word', () => {
    const message =
      "No llms.txt found at any candidate location (https://kyverno.io/docs/llms.txt, https://kyverno.io/llms.txt) - it's missing";
    expect(render({ message }).get('[data-test="result"]').text()).toBe(message);
  });

  it('renders markup in a stored message as text', () => {
    const wrapper = render({ message: '<b>x</b>' });
    expect(wrapper.find('[data-test="result"] b').exists()).toBe(false);
    expect(wrapper.get('[data-test="result"]').text()).toBe('<b>x</b>');
  });

  it('appends the cross-reference to a dependency skip', () => {
    const wrapper = render({
      status: 'skip',
      message: 'Needs an llms.txt file',
      skipReason: 'needs-llms-txt',
    });
    expect(wrapper.get('[data-test="result"]').text()).toBe(
      'Needs an llms.txt file (see “An llms.txt file is published”).',
    );
  });

  it.each(['fail', 'error', 'warn'] as DocsReadinessCheckStatus[])(
    'shows "How to fix:" for %s',
    (status) => {
      const fix = render({ status }).get('[data-test="fix"]');
      expect(fix.text()).toContain('How to fix:');
      expect(fix.text()).toContain('Publish an llms.txt file');
    },
  );

  it.each(['pass', 'skip'] as DocsReadinessCheckStatus[])(
    'hides "How to fix:" for %s',
    (status) => {
      expect(render({ status }).find('[data-test="fix"]').exists()).toBe(false);
    },
  );

  it('hides "How to fix:" for an unknown id that failed', () => {
    expect(
      render({ id: 'brand-new-check', status: 'fail' }).find('[data-test="fix"]').exists(),
    ).toBe(false);
  });

  it('has no Details toggle and never shows the check id', () => {
    const wrapper = render();
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('llms-txt-exists');
  });
});
