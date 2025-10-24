// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxAvatar from './avatar.vue';
import { avatarTypes, avatarSizes } from './types/Avatar.types';

export default {
  title: 'LinuxFoundation/Avatar',
  component: LfxAvatar,
  tags: ['autodocs'],
  argTypes: {
    type: {
      description: 'Type of the avatar',
      control: 'select',
      options: avatarTypes,
    },
    size: {
      description: 'Size of the avatar',
      control: 'select',
      options: avatarSizes,
    },
    src: {
      description: 'Source of the avatar',
      control: {
        type: 'text',
      },
    },
  },
};

export const Default = {
  args: {
    type: 'member',
    size: 'normal',
    src: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg',
  },
};

export const UserNoImage = {
  args: {
    type: 'member',
    size: 'normal',
  },
};

export const OrganizationWithImage = {
  args: {
    type: 'organization',
    size: 'normal',
    src: 'https://static-00.iconduck.com/assets.00/linux-icon-256x256-773o7tyd.png',
  },
};

export const OrganizationNoImage = {
  args: {
    type: 'organization',
    size: 'normal',
  },
};
