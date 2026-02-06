// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface Tab {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface TabsProps {
  modelValue: string;
  tabs: Tab[];
  tabStyle?: 'pill' | 'default';
  widthType?: 'full' | 'inline';
}

export interface TabsEmits {
  (e: 'update:modelValue', value: string): void;
}
