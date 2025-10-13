// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxToggle from './toggle.vue';

export default {
  title: 'LinuxFoundation/Toggle',
  component: LfxToggle,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Toggle value (checked/unchecked)',
      defaultValue: false,
      control: 'boolean',
    },
    label: {
      description: 'Label text displayed next to toggle',
      defaultValue: '',
      control: 'text',
    },
    disabled: {
      description: 'Specifies if toggle is disabled',
      defaultValue: false,
      control: 'boolean',
    },
    size: {
      description: 'Toggle size variant',
      defaultValue: 'default',
      control: 'select',
      options: ['default', 'small'],
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when toggle state changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  label: 'Default',
  args: {
    modelValue: false,
    label: 'Toggle switch',
    disabled: false,
    size: 'default',
  },
};

export const Checked = {
  label: 'Checked',
  args: {
    modelValue: true,
    label: 'Toggle switch',
    disabled: false,
    size: 'default',
  },
};

export const Disabled = {
  label: 'Disabled',
  args: {
    modelValue: false,
    label: 'Toggle switch',
    disabled: true,
    size: 'default',
  },
};

export const DisabledChecked = {
  label: 'Disabled Checked',
  args: {
    modelValue: true,
    label: 'Toggle switch',
    disabled: true,
    size: 'default',
  },
};

export const Small = {
  label: 'Small',
  args: {
    modelValue: false,
    label: 'Toggle switch',
    disabled: false,
    size: 'small',
  },
};

export const SmallChecked = {
  label: 'Small Checked',
  args: {
    modelValue: true,
    label: 'Toggle switch',
    disabled: false,
    size: 'small',
  },
};

export const WithoutLabel = {
  label: 'Without Label',
  args: {
    modelValue: false,
    label: '',
    disabled: false,
    size: 'default',
  },
};