// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxTag from './tag.vue';
import { tagSizes, tagStyles, tagTypes } from './types/tag.types';

export default {
  title: 'LinuxFoundation/Tag',
  component: LfxTag,
  tags: ['autodocs'],
  argTypes: {
    variation: {
      description: 'The visual variation/style of the tag',
      control: 'select',
      options: tagStyles,
    },
    size: {
      description: 'The size of the tag',
      control: 'select',
      options: tagSizes,
    },
    type: {
      description: 'The type of the tag',
      control: 'select',
      options: tagTypes,
    },

    // Slots
    default: {
      description: 'Text or html content of the tag',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    default: "I'm tag content",
    variation: 'default',
    size: 'medium',
    type: 'solid',
  },
};

export const Info = {
  args: {
    default: "I'm tag content",
    variation: 'info',
    size: 'medium',
    type: 'solid',
  },
};

export const Positive = {
  args: {
    default: "I'm tag content",
    variation: 'positive',
    size: 'medium',
    type: 'solid',
  },
};

export const Warning = {
  args: {
    default: "I'm tag content",
    variation: 'warning',
    size: 'medium',
    type: 'solid',
  },
};

export const Negative = {
  args: {
    default: "I'm tag content",
    variation: 'negative',
    size: 'medium',
    type: 'solid',
  },
};

export const Small = {
  args: {
    default: "I'm tag content",
    variation: 'info',
    size: 'small',
    type: 'solid',
  },
};

export const Transparent = {
  args: {
    default: "I'm tag content",
    variation: 'info',
    size: 'medium',
    type: 'transparent',
  },
};
