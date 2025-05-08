// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useToast } from 'primevue/usetoast';
import type { ToastOptions, ToastSeverity, ToastType } from './types/toast.types';

const useToastService = () => {
  const toast = useToast();
  const showToast = (message: string, toastType: ToastType, icon?: string, delay: number = 3000) => {
    const test: ToastOptions = {
      severity: toastType as ToastSeverity,
      summary: toastType,
      detail: message,
      closable: false,
      icon,
      life: delay
    };
    toast.add(test);
  }

  return {
    showToast
  }
}

export default useToastService;
