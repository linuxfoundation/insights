// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';

import HealthScore from '../health-score.vue';

// Renders the tooltip content inline unless the tooltip is disabled, so no hover is needed.
const mountScore = (props: { label: string; healthMaxScore?: number | null }) =>
  mount(HealthScore, {
    props,
    global: {
      stubs: {
        LfxTooltip: {
          props: ['disabled'],
          template: '<div><slot /><slot v-if="!disabled" name="content" /></div>',
        },
      },
    },
  });

describe('health-score.vue', () => {
  it.each([
    ['excellent', 'Excellent', 'positive-solid'],
    ['healthy', 'Healthy', 'positive'],
    ['fair', 'Fair', 'accent'],
    ['concerning', 'Concerning', 'warning'],
    ['critical', 'Critical', 'negative-solid'],
  ])('renders the %s label with the %s tag variation', (label, text, variation) => {
    const wrapper = mountScore({ label });

    expect(wrapper.find('.c-tag').text()).toBe(text);
    expect(wrapper.find(`.c-tag--${variation}`).exists()).toBe(true);
  });

  it('matches the label case-insensitively', () => {
    const wrapper = mountScore({ label: 'Fair' });

    expect(wrapper.find('.c-tag').text()).toBe('Fair');
    expect(wrapper.find('.c-tag--accent').exists()).toBe(true);
  });

  it.each([null, undefined, 100])(
    'shows no asterisk or explanation for a healthMaxScore of %s',
    (max) => {
      const wrapper = mountScore({ label: 'excellent', healthMaxScore: max });

      expect(wrapper.find('.c-tag').text()).toBe('Excellent');
      expect(wrapper.text()).not.toContain('partial');
      expect(wrapper.find('.sr-only').exists()).toBe(false);
    },
  );

  it.each([
    [60, 'Maintainer Health'],
    [65, 'Security & Supply Chain'],
    [75, 'Development Activity'],
  ])('marks a healthMaxScore of %i as partial and names %s', (max, category) => {
    const wrapper = mountScore({ label: 'excellent', healthMaxScore: max });

    expect(wrapper.find('.c-tag').text()).toBe('Excellent*');
    expect(wrapper.find('.c-tag--positive-solid').exists()).toBe(true);
    expect(wrapper.text()).toContain(`the ${category} category is missing data`);
  });

  it('gives screen readers the same partial explanation as the tooltip', () => {
    const wrapper = mount(HealthScore, { props: { label: 'excellent', healthMaxScore: 65 } });

    expect(wrapper.find('.c-tag').text()).toBe('Excellent*');
    expect(wrapper.find('.sr-only').text()).toBe(
      'This Health Score is partial because the Security & Supply Chain category is missing data for this project. ' +
        'The score is computed from the remaining categories only.',
    );
  });

  it('explains a partial score whose missing category is unknown', () => {
    const generic =
      'This Health Score is partial because some categories are missing data for this project. ' +
      'The score is computed from the remaining categories only.';
    const wrapper = mountScore({ label: 'healthy', healthMaxScore: 50 });

    expect(wrapper.find('.c-tag').text()).toBe('Healthy*');
    expect(wrapper.find('.sr-only').text()).toBe(generic);
    expect(wrapper.find('[aria-hidden="true"]').text()).toBe(generic);
  });

  // The sr-only span is absolutely positioned, so the trigger contains it inside the table's scroll box.
  it('wraps the tag in a positioned tooltip trigger', () => {
    const wrapper = mount(HealthScore, { props: { label: 'excellent', healthMaxScore: 75 } });

    expect(wrapper.find('.c-popover__trigger .c-tag').text()).toBe('Excellent*');
    expect(wrapper.find('.c-popover__trigger').classes()).toContain('relative');
    expect(wrapper.find('.c-popover__trigger .sr-only').exists()).toBe(true);
  });

  it('hides the open tooltip from screen readers so the sr-only text is announced once', async () => {
    const wrapper = mount(HealthScore, {
      props: { label: 'excellent', healthMaxScore: 60 },
      attachTo: document.body,
    });

    await wrapper.find('.c-popover__trigger').trigger('mouseenter');
    await flushPromises();

    const tooltip = document.body.querySelector('.c-popover__content');
    expect(tooltip?.textContent).toContain('the Maintainer Health category is missing data');
    expect(tooltip?.querySelector('[aria-hidden="true"]')?.textContent).toBe(tooltip?.textContent);
    expect(wrapper.find('.sr-only').attributes('aria-hidden')).toBeUndefined();
    wrapper.unmount();
  });

  // The OSI lists navigate through a row click handler, so the tooltip must let clicks bubble.
  it.each([
    ['a partial', 75],
    ['a full', 100],
  ])('lets a click on %s score reach the parent row', async (_, max) => {
    const onRowClick = vi.fn();
    const wrapper = mount(
      {
        components: { HealthScore },
        setup: () => ({ onRowClick, max }),
        template:
          '<table><tbody><tr @click="onRowClick"><td><health-score label="excellent" :health-max-score="max" /></td></tr></tbody></table>',
      },
      { attachTo: document.body },
    );

    await wrapper.find('.c-tag').trigger('click');

    expect(onRowClick).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('renders a dash for an unknown label instead of defaulting to Critical', () => {
    const wrapper = mountScore({ label: 'unknown', healthMaxScore: 75 });

    expect(wrapper.find('.c-tag').exists()).toBe(false);
    expect(wrapper.text()).toBe('-');
  });
});
