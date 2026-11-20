// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import { useDocsReadinessCorrectionStore } from '~/components/modules/project/store/docs-readiness-correction.store';

import CorrectionGlobal from './correction-global.vue';

vi.mock('~~/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: ref(true), login: vi.fn() }),
}));

const ModalStub = {
  name: 'LfxDocsReadinessCorrectionModal',
  props: ['context'],
  template: '<div class="modal-stub" @click="$emit(\'close\')">{{ context.projectName }}</div>',
};

const mountGlobal = () =>
  mount(CorrectionGlobal, {
    global: {
      stubs: { LfxDocsReadinessCorrectionModal: ModalStub },
    },
  });

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('correction-global.vue', () => {
  test('renders nothing while the store is closed', () => {
    expect(mountGlobal().find('.modal-stub').exists()).toBe(false);
  });

  test("renders the modal with the store's context and closes through closeCorrection", async () => {
    const store = useDocsReadinessCorrectionStore();
    store.openCorrection({
      projectSlug: 'kubernetes',
      projectName: 'Kubernetes',
      currentDocsUrl: null,
      state: 'scored',
    });
    const w = mountGlobal();
    expect(w.find('.modal-stub').text()).toBe('Kubernetes');

    const first = w.find('.modal-stub').element;
    store.openCorrection({
      projectSlug: 'k8s',
      projectName: 'K8s',
      currentDocsUrl: null,
      state: 'scored',
    });
    await w.vm.$nextTick();
    expect(w.find('.modal-stub').element).not.toBe(first);

    await w.find('.modal-stub').trigger('click');
    expect(store.isCorrectionModalOpen).toBe(false);
    expect(w.find('.modal-stub').exists()).toBe(false);
  });
});
