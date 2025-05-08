// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxButton from '../button/button.vue';
import LfxModal from './modal.vue';

export default {
  title: 'LinuxFoundation/Modal',
  component: LfxModal,
  tags: ['autodocs'],
  argTypes: {
    // Props
    modelValue: {
      description: 'Is modal open',
      defaultValue: 'false',
      control: 'boolean',
    },

    width: {
      description: 'Specifies modal width',
      defaultValue: '37.5rem',
      control: 'text',
    },

    closeFunction: {
      description: 'Function that prevents modal from closing',
      control: {
        type: null,
      },
    },

    // Slots
    default: {
      description: 'Any content belonging to modal',
      control: {
        type: null,
      },
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when modal open state changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    modelValue: true,
    width: '37.5rem',
  },
  render: (args) => ({
    components: { LfxModal, LfxButton },
    setup() {
      const isModalOpen = ref(true);

      return { args, isModalOpen };
    },
    template: `<div>
      <lfx-button @click="isModalOpen = true">Open Modal</lfx-button>
      <lfx-modal v-model="isModalOpen" :width="args.width">
        <div class="p-5 text-heading-2">
          This is modal content
        </div>
      </lfx-modal>
    </div>`,
  }),
};
