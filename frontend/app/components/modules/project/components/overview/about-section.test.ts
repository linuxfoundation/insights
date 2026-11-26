// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Ref } from 'vue';

import AboutSection from './about-section.vue';

const state = vi.hoisted(() => ({
  project: null as unknown as Ref<{ isLF: boolean } | null>,
  loading: null as unknown as Ref<boolean>,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

vi.mock('~~/app/components/modules/project/store/project.store', async () => {
  const { ref: vueRef } = await import('vue');
  state.project = vueRef({ isLF: true });
  state.loading = vueRef(false);
  return {
    useProjectStore: vi.fn(() => ({ isProjectLoading: state.loading, project: state.project })),
  };
});

const tileExists = () =>
  shallowMount(AboutSection).findComponent({ name: 'LfxProjectDocsReadinessTile' }).exists();

describe('about-section.vue', () => {
  beforeEach(() => {
    state.project.value = { isLF: true };
    state.loading.value = false;
  });

  test('mounts the tile for an LF project', () => {
    expect(tileExists()).toBe(true);
  });

  test('does not mount the tile for a non-LF project', () => {
    state.project.value = { isLF: false };
    expect(tileExists()).toBe(false);
  });

  test('does not mount the tile while the project is null', () => {
    state.project.value = null;
    expect(tileExists()).toBe(false);
  });

  test('does not mount the tile while the next project loads over a stale LF project', () => {
    state.loading.value = true;
    expect(tileExists()).toBe(false);
  });

  test('keeps the tile after the Data sources block', () => {
    const root = shallowMount(AboutSection).element;
    const last = root.lastElementChild as Element;
    expect(last.tagName.toLowerCase()).toContain('docs-readiness-tile');
  });
});
