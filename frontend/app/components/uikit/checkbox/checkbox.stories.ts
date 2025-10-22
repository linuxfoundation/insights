// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxCheckbox from './checkbox.vue';

export default {
  title: 'LinuxFoundation/Checkbox',
  component: LfxCheckbox,
  tags: ['autodocs'],
  argTypes: {
    // Props
    modelValue: {
      description: 'Checkbox checked state',
      control: 'boolean',
    },
    value: {
      description: 'Value for checkbox when checked (used in checkbox groups)',
      control: {
        type: null,
      },
    },
    disabled: {
      description: 'Specifies if checkbox is disabled',
      defaultValue: false,
      control: 'boolean',
    },

    // Slots
    default: {
      description: 'Text or html content of the checkbox label',
      control: {
        type: null,
      },
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when checkbox value changes',
      control: {
        type: null,
      },
    },
  },
};

export const Unchecked = {
  label: 'Unchecked',
  args: {
    modelValue: false,
    disabled: false,
    default: 'Checkbox text',
  },
};

export const Checked = {
  label: 'Checked',
  args: {
    modelValue: true,
    disabled: false,
    default: 'Checkbox text',
  },
};

export const Disabled = {
  label: 'Disabled',
  args: {
    modelValue: true,
    disabled: true,
    default: 'Checkbox text',
  },
};

export const DisabledUnchecked = {
  label: 'Disabled Unchecked',
  args: {
    modelValue: false,
    disabled: true,
    default: 'Checkbox text',
  },
};
