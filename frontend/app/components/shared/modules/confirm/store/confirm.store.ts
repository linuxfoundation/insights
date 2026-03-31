// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const defaultOptions: ConfirmOptions = {
  title: 'Confirm',
  message: '',
  confirmLabel: 'Ok',
  cancelLabel: 'Cancel',
};

export const useConfirmStore = defineStore('confirm', () => {
  const isConfirmModalOpen = ref(false);
  const confirmOptions = ref<ConfirmOptions>(defaultOptions);
  const resolvePromise = ref<((value: boolean) => void) | null>(null);

  const openConfirmModal = (options: ConfirmOptions): Promise<boolean> => {
    confirmOptions.value = { ...defaultOptions, ...options };
    isConfirmModalOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise.value = resolve;
    });
  };

  const confirm = () => {
    isConfirmModalOpen.value = false;
    resolvePromise.value?.(true);
    resolvePromise.value = null;
  };

  const cancel = () => {
    isConfirmModalOpen.value = false;
    resolvePromise.value?.(false);
    resolvePromise.value = null;
  };

  return {
    isConfirmModalOpen,
    confirmOptions,
    openConfirmModal,
    confirm,
    cancel,
  };
});
