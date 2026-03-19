// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxRadio from './radio.vue';

export default {
  title: 'LinuxFoundation/Radio',
  component: LfxRadio,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Currently selected value in the radio group',
      control: 'text',
    },
    value: {
      description: 'Value of this radio option',
      control: 'text',
    },
    name: {
      description: 'Name attribute for grouping radios',
      control: 'text',
    },
    disabled: {
      description: 'Specifies if radio is disabled',
      defaultValue: false,
      control: 'boolean',
    },
    size: {
      description: 'Radio size variant',
      defaultValue: 'default',
      control: 'select',
      options: ['default', 'small'],
    },
    default: {
      description: 'Label text or content displayed next to radio',
      control: {
        type: null,
      },
    },
    'update:modelValue': {
      description: 'Event triggered when radio selection changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  label: 'Default',
  args: {
    modelValue: '',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: false,
    size: 'default',
  },
};

export const Selected = {
  label: 'Selected',
  args: {
    modelValue: 'option1',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: false,
    size: 'default',
  },
};

export const Disabled = {
  label: 'Disabled',
  args: {
    modelValue: '',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: true,
    size: 'default',
  },
};

export const DisabledSelected = {
  label: 'Disabled Selected',
  args: {
    modelValue: 'option1',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: true,
    size: 'default',
  },
};

export const Small = {
  label: 'Small',
  args: {
    modelValue: '',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: false,
    size: 'small',
  },
};

export const SmallSelected = {
  label: 'Small Selected',
  args: {
    modelValue: 'option1',
    value: 'option1',
    name: 'radio-group',
    default: 'Radio option',
    disabled: false,
    size: 'small',
  },
};

export const WithoutLabel = {
  label: 'Without Label',
  args: {
    modelValue: '',
    value: 'option1',
    name: 'radio-group',
    disabled: false,
    size: 'default',
  },
};
