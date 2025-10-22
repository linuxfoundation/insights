// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxSkeleton from './skeleton.vue';

export default {
  title: 'LinuxFoundation/Skeleton',
  component: LfxSkeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      description: 'Width of the skeleton (CSS value)',
      control: 'text',
    },
    height: {
      description: 'Height of the skeleton (CSS value)',
      control: 'text',
    },
    borderRadius: {
      description: 'Border radius of the skeleton (CSS value)',
      control: 'text',
    },
    animation: {
      description: 'Animation type',
      control: 'select',
      options: ['wave', 'none'],
    },
  },
};

export const Default = {
  args: {
    width: '100%',
    height: '1.5rem',
  },
  render: (args) => ({
    components: { LfxSkeleton },
    setup() {
      return { args };
    },
    template: `
    <div class="w-96 space-y-4">
      <lfx-skeleton v-bind="args" />
    </div>`,
  }),
};

export const Circle = {
  args: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
  },
  render: (args) => ({
    components: { LfxSkeleton },
    setup() {
      return { args };
    },
    template: `
    <div class="flex gap-4">
      <lfx-skeleton v-bind="args" />
      <lfx-skeleton v-bind="args" />
      <lfx-skeleton v-bind="args" />
    </div>`,
  }),
};

export const Card = {
  render: () => ({
    components: { LfxSkeleton },
    template: `
    <div class="w-80 p-6 border rounded-lg space-y-4">
      <div class="flex items-center gap-4">
        <lfx-skeleton width="3rem" height="3rem" border-radius="50%" />
        <div class="flex-1 space-y-2">
          <lfx-skeleton width="60%" height="1rem" />
          <lfx-skeleton width="40%" height="0.875rem" />
        </div>
      </div>
      <lfx-skeleton width="100%" height="8rem" border-radius="0.5rem" />
      <div class="space-y-2">
        <lfx-skeleton width="100%" height="0.875rem" />
        <lfx-skeleton width="90%" height="0.875rem" />
        <lfx-skeleton width="70%" height="0.875rem" />
      </div>
    </div>`,
  }),
};

export const Table = {
  render: () => ({
    components: { LfxSkeleton },
    template: `
    <div class="w-full space-y-3">
      <lfx-skeleton width="100%" height="2.5rem" />
      <lfx-skeleton width="100%" height="2rem" />
      <lfx-skeleton width="100%" height="2rem" />
      <lfx-skeleton width="100%" height="2rem" />
      <lfx-skeleton width="100%" height="2rem" />
    </div>`,
  }),
};

export const UserProfile = {
  render: () => ({
    components: { LfxSkeleton },
    template: `
    <div class="w-96 space-y-6">
      <div class="flex items-center gap-4">
        <lfx-skeleton width="4rem" height="4rem" border-radius="50%" />
        <div class="flex-1 space-y-2">
          <lfx-skeleton width="70%" height="1.25rem" />
          <lfx-skeleton width="50%" height="1rem" />
        </div>
      </div>
      <div class="space-y-3">
        <lfx-skeleton width="100%" height="1rem" />
        <lfx-skeleton width="95%" height="1rem" />
        <lfx-skeleton width="85%" height="1rem" />
      </div>
      <div class="flex gap-3">
        <lfx-skeleton width="30%" height="2.5rem" border-radius="0.5rem" />
        <lfx-skeleton width="30%" height="2.5rem" border-radius="0.5rem" />
      </div>
    </div>`,
  }),
};

export const List = {
  render: () => ({
    components: { LfxSkeleton },
    template: `
    <div class="w-full space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4">
        <lfx-skeleton width="2.5rem" height="2.5rem" border-radius="0.25rem" />
        <div class="flex-1 space-y-2">
          <lfx-skeleton width="40%" height="1rem" />
          <lfx-skeleton width="60%" height="0.875rem" />
        </div>
        <lfx-skeleton width="4rem" height="1.5rem" border-radius="0.25rem" />
      </div>
    </div>`,
  }),
};
