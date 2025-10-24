// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxIconButton from './icon-button.vue';
import { iconButtonSizes, iconButtonTypes } from './types/icon-button.types';

export default {
  title: 'LinuxFoundation/IconButton',
  component: LfxIconButton,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'The icon of the button (font-awesome icon name)',
      control: 'text',
    },
    type: {
      description: 'The visual style type of the button',
      control: 'select',
      options: iconButtonTypes,
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: iconButtonSizes,
    },
    iconType: {
      description: 'The icon type/weight (regular, solid, light)',
      control: 'select',
      options: ['regular', 'solid', 'light'],
      defaultValue: 'light',
    },
    iconSize: {
      description: 'The size of the icon in pixels',
      control: 'number',
      defaultValue: 16,
    },
    disabled: {
      description: 'Whether the button is disabled',
      control: 'boolean',
    },
  },
};

export const Default = {
  args: {
    type: 'default',
    size: 'medium',
    icon: 'compass',
    disabled: false,
  },
};

export const Transparent = {
  args: {
    type: 'transparent',
    size: 'medium',
    icon: 'compass',
    disabled: false,
  },
};
