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
      description: 'Popover placement',
      defaultValue: 'bottom-start',
      control: 'select',
      options: popoverPlacements,
    },
    triggerEvent: {
      description: 'Popover trigger',
      defaultValue: 'click',
      control: 'select',
      options: popoverTrigger,
    },
    spacing: {
      description: 'Popover spacing',
      defaultValue: '4',
      control: 'number',
    },
    disabled: {
      description: 'Specifies if popover is hidden',
      defaultValue: false,
      control: 'boolean',
    },

    // Slots
    default: {
      description: 'Any content belonging to trigger',
      control: {
        type: null,
      },
    },
    content: {
      description: 'Any content belonging to popover',
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
