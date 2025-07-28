// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ToastMessageOptions } from 'primevue/toast';

export type ToastSeverity = 'info' | 'error' | 'secondary' | 'success' | 'warn' | 'contrast' | undefined;
export enum ToastTypesEnum {
  default = 'secondary',
  info = 'info',
  positive = 'success',
  warning = 'warn',
  negative = 'error'
}

export const toastTypes = ['secondary', 'info', 'success', 'warn', 'danger'] as const;
export const toastThemes = ['light', 'dark'] as const;

export type ToastType = (typeof ToastTypesEnum)[keyof typeof ToastTypesEnum];
export type ToastTheme = (typeof toastThemes)[number];

export interface ToastOptions extends ToastMessageOptions {
  icon?: string;
  title?: string;
  actionLabel?: string;
    action?: () => void;
    actionUrl?: string;
}
