// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxSpinner from './spinner.vue';

export default {
  title: 'LinuxFoundation/Spinner',
  component: LfxSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size of the spinner in pixels',
      defaultValue: 16,
      control: 'number',
    },
    type: {
      description: 'Icon type/style for the spinner',
      defaultValue: 'regular',
      control: 'select',
      options: ['regular', 'solid', 'light'],
    },
  },
};

export const Default = {
  args: {
    size: 16,
    type: 'regular',
  }
};

export const Large = {
  args: {
    size: 32,
    type: 'regular',
  }
};

export const Small = {
  args: {
    size: 12,
    type: 'regular',
  }
};

export const Solid = {
  args: {
    size: 16,
    type: 'solid',
  }
};

export const Light = {
  args: {
    size: 16,
    type: 'light',
  }
};
