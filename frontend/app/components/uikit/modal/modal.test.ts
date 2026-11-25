// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';
import { defineComponent, ref } from 'vue';

import LfxModal from './modal.vue';

const Harness = defineComponent({
  components: { LfxModal },
  setup() {
    const open = ref(false);
    return { open };
  },
  template: `
    <button class="opener" @click="open = true">Open</button>
    <lfx-modal v-model="open"><p class="inside">Content</p></lfx-modal>
  `,
});

const mountHarness = () => mount(Harness, { global: { stubs: { teleport: true } } });

const click = (el: Element, detail: number) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));

describe('LfxModal backdrop', () => {
  test('stays open when a double-click on the opener lands its second click on the backdrop', async () => {
    const w = mountHarness();
    click(w.find('.opener').element, 1);
    await w.vm.$nextTick();
    click(w.find('.c-modal').element, 2);
    await w.vm.$nextTick();

    expect(w.find('.c-modal').exists()).toBe(true);
  });

  test('closes on a single click on the backdrop', async () => {
    const w = mountHarness();
    click(w.find('.opener').element, 1);
    await w.vm.$nextTick();
    click(w.find('.c-modal').element, 1);
    await w.vm.$nextTick();

    expect(w.find('.c-modal').exists()).toBe(false);
  });

  test('stays open on a click inside the content', async () => {
    const w = mountHarness();
    click(w.find('.opener').element, 1);
    await w.vm.$nextTick();
    click(w.find('.inside').element, 1);
    await w.vm.$nextTick();

    expect(w.find('.c-modal').exists()).toBe(true);
  });
});
