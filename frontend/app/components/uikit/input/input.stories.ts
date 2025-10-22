// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxInput from './input.vue';

export default {
  title: 'LinuxFoundation/Input',
  component: LfxInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Input value (string or number)',
      defaultValue: undefined,
      control: 'text',
    },
    placeholder: {
      description: 'Input placeholder',
      defaultValue: '',
      control: 'text',
    },
    disabled: {
      description: 'Specifies if input is disabled',
      defaultValue: false,
      control: 'boolean',
    },
    invalid: {
      description: 'Specifies if input is invalid',
      defaultValue: false,
      control: 'boolean',
    },
    type: {
      description: 'HTML input type (text, password, email, number, etc.)',
      defaultValue: 'text',
      control: 'text',
    },
    tabindex: {
      description: 'Tab index for keyboard navigation',
      control: 'text',
    },

    // Slots
    prefix: {
      description: 'Input prefix content (icons, text, etc.)',
      control: {
        type: null,
      },
    },
    suffix: {
      description: 'Input suffix content (icons, text, etc.)',
      control: {
        type: null,
      },
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when value changes',
      control: {
        type: null,
      },
    },
  },
};

export const Regular = {
  label: 'Required',
  args: {
    placeholder: 'Placeholder',
    modelValue: '',
    disabled: false,
    invalid: false,
    type: 'text',
  },
};

export const Disabled = {
  label: 'Required',
  args: {
    placeholder: 'Placeholder',
    modelValue: '',
    disabled: true,
    invalid: false,
    type: 'text',
  },
};

export const Invalid = {
  label: 'Required',
  args: {
    placeholder: 'Placeholder',
    modelValue: 'Invalid value',
    disabled: false,
    invalid: true,
    type: 'text',
  },
};

export const Prefix = {
  label: 'Required',
  args: {
    placeholder: 'Your name',
    modelValue: 'John Doe',
    prefix: 'prefix',
    disabled: false,
    invalid: false,
    type: 'text',
  },
};

export const Suffix = {
  label: 'Required',
  args: {
    placeholder: 'Your name',
    modelValue: 'John Doe',
    suffix: 'suffix',
    disabled: false,
    invalid: false,
    type: 'text',
  },
};
