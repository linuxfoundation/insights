// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxButton from '@/components/uikit/button/button.vue';
import LfxPopover from '@/components/uikit/popover/popover.vue';
import { popoverPlacements } from '@/components/uikit/popover/types/PopoverPlacement';
import { popoverTrigger } from '@/components/uikit/popover/types/PopoverTrigger';

export default {
  title: 'LinuxFoundation/Popover',
  component: LfxPopover,
  tags: ['autodocs'],
  argTypes: {
    // Props
    placement: {
      description: 'Popover placement position',
      defaultValue: 'bottom-start',
      control: 'select',
      options: popoverPlacements,
    },
    triggerEvent: {
      description: 'Event that triggers the popover (click or hover)',
      defaultValue: 'click',
      control: 'select',
      options: popoverTrigger,
    },
    visibility: {
      description: 'Controls popover visibility (v-model:visibility)',
      defaultValue: false,
      control: 'boolean',
    },
    spacing: {
      description: 'Spacing between trigger and popover content in pixels',
      defaultValue: 4,
      control: 'number',
    },
    disabled: {
      description: 'Disables the popover (prevents it from showing)',
      defaultValue: false,
      control: 'boolean',
    },
    matchWidth: {
      description: 'Makes popover width match the trigger element width',
      defaultValue: false,
      control: 'boolean',
    },
    isModal: {
      description: 'Displays popover as a modal (closes on backdrop click)',
      defaultValue: false,
      control: 'boolean',
    },

    // Slots
    default: {
      description: 'Content for the trigger element',
      control: {
        type: null,
      },
    },
    content: {
      description: 'Content displayed in the popover',
      control: {
        type: null,
      },
    },

    // Events
    'update:visibility': {
      description: 'Event triggered when visibility changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    placement: 'bottom-start',
    disabled: false,
    spacing: 4,
    triggerEvent: 'click',
  },
  render: (args: { placement: string; disabled: boolean; spacing: number; triggerEvent: string }) => ({
    components: { LfxPopover, LfxButton },
    setup() {
      return { args };
    },
    template: `
      <lfx-popover 
        :spacing="args.spacing" 
        :disabled="args.disabled" 
        :placement="args.placement" 
        :trigger-event="args.triggerEvent"
      >
          <lfx-button>Open Popover</lfx-button>
        <template #content>
          <div class="p-10 bg-white border rounded-l border-gray-100">
            <p>This is popover content</p>
          </div>
        </template>
      </lfx-popover>
    `,
  }),
};
