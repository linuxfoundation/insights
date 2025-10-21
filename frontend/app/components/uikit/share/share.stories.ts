// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxIconButton from '../icon-button/icon-button.vue';
import LfxButton from '../button/button.vue';
import LfxShare from './share.vue';

export default {
  title: 'LinuxFoundation/Share',
  component: LfxShare,
  tags: ['autodocs'],
  argTypes: {
    url: {
      description: 'URL to share (defaults to current page URL if not provided)',
      control: 'text',
    },

    // Slots
    default: {
      description: 'Trigger element (button, icon, etc.)',
      control: {
        type: null,
      },
    },
  },
};

export const WithIconButton = {
  args: {
    url: undefined,
  },
  render: (args) => ({
    components: { LfxShare, LfxIconButton },
    setup() {
      return { args };
    },
    template: `
    <div class="space-y-4">
      <p class="text-sm text-neutral-500">Click the share button to copy the current page URL</p>
      <lfx-share v-bind="args">
        <lfx-icon-button icon="share-nodes" type="default" />
      </lfx-share>
    </div>`,
  }),
};

export const WithButton = {
  args: {
    url: undefined,
  },
  render: (args) => ({
    components: { LfxShare, LfxButton },
    setup() {
      return { args };
    },
    template: `
    <lfx-share v-bind="args">
      <lfx-button type="secondary" icon="share-nodes" icon-position="left">
        Share this page
      </lfx-button>
    </lfx-share>`,
  }),
};

export const CustomURL = {
  args: {
    url: 'https://insights.linuxfoundation.org',
  },
  render: (args) => ({
    components: { LfxShare, LfxButton },
    setup() {
      return { args };
    },
    template: `
    <div class="space-y-4">
      <p class="text-sm text-neutral-500">This will share: {{ args.url }}</p>
      <lfx-share v-bind="args">
        <lfx-button type="primary" icon="share-nodes" icon-position="left">
          Share LFX Insights
        </lfx-button>
      </lfx-share>
    </div>`,
  }),
};

export const MultipleShareButtons = {
  render: () => ({
    components: { LfxShare, LfxIconButton },
    template: `
    <div class="flex gap-3">
      <lfx-share url="https://github.com/linuxfoundation/insights">
        <lfx-icon-button icon="share-nodes" type="default" />
      </lfx-share>
      <lfx-share url="https://twitter.com/linuxfoundation">
        <lfx-icon-button icon="share-nodes" type="default" />
      </lfx-share>
      <lfx-share url="https://linkedin.com/company/the-linux-foundation">
        <lfx-icon-button icon="share-nodes" type="default" />
      </lfx-share>
    </div>`,
  }),
};
