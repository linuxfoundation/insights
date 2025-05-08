// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxIcon from '@/components/uikit/icon/icon.vue';

export default {
  title: 'LinuxFoundation/Icon',
  component: LfxIcon,
  tags: ['autodocs'],
  argTypes: {
    // Props
    name: {
      description: 'Specifies icon name',
      defaultValue: '',
      control: 'text'
    },
    type: {
      description: 'Specifies icon type',
      defaultValue: 'light',
      control: 'select',
      options: ['light', 'regular', 'solid', 'duotone']
    },
    size: {
      description: 'Specifies icon size in px',
      defaultValue: '16',
      control: 'number'
    }
  }
};

export const Default = {
  args: {
    name: 'compass',
    type: 'light',
    size: 48
  }
};
