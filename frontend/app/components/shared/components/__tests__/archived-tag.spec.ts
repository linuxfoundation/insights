// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ArchivedTag from '../archived-tag.vue';

// Renders the popover content inline, so no hover is needed.
const mountTag = (props: { label: string; archived?: boolean; unavailable?: boolean }) =>
  mount(ArchivedTag, {
    props,
    global: {
      stubs: {
        LfxPopover: {
          template: '<div><slot /><div class="popover"><slot name="content" /></div></div>',
        },
      },
    },
  });

describe('archived-tag.vue', () => {
  it.each([
    [
      { label: 'Unavailable', unavailable: true },
      'no longer available on its source platform',
      false,
    ],
    [
      { label: 'Archived', archived: true },
      'Archived repositories are excluded from Health Score',
      true,
    ],
    [{ label: 'Excluded' }, 'Repositories excluded from Health Score', false],
  ])('explains the %o repository label', (props, explanation, hasArchiveIcon) => {
    const wrapper = mountTag(props);

    expect(wrapper.find('.c-tag').text()).toBe(props.label);
    expect(wrapper.find('.popover').text()).toContain(explanation);
    expect(wrapper.find('.popover').text()).toContain('You can still access historical data');
    expect(wrapper.find('.c-tag .c-icon').exists()).toBe(hasArchiveIcon);
  });
});
