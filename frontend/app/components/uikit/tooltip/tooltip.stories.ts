// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxButton from '../button/button.vue';
import LfxTooltip from './tooltip.vue';
import { tooltipPlacements } from './types/TooltipPlacement';

export default {
  title: 'LinuxFoundation/Tooltip',
  component: LfxTooltip,
  tags: ['autodocs'],
  argTypes: {
    // Props
    placement: {
      description: 'Specifies tooltip placement',
      defaultValue: 'top',
      control: 'select',
      options: tooltipPlacements
    },
    content: {
      description: 'Content of the tooltip',
      control: 'text'
    },
    disabled: {
      description: 'Specifies if tooltip is hidden',
      defaultValue: false,
      control: 'boolean'
    },

    // Slots
    default: {
      description: 'Text or html content of the tooltip',
      control: {
        type: null
      }
    }
  }
};

export const Default = {
  label: 'Primary',
  args: {
    placement: 'top',
    disabled: false,
    content: 'Tooltip content',
    default: 'Hover me'
  },
  render: (args) => ({
    components: { LfxTooltip, LfxButton },
    template: `
    <div style="height: 150px; display: flex; justify-content: center; align-items: center;">
      <lfx-tooltip :placement="${args.placement}" :disabled="${args.disabled}" content="${args.content}">
        <lfx-button>Hover me</lfx-button>
      </lfx-tooltip>
    </div>`
  })
};

export const CustomContent = {
  label: 'Custom Content',
  args: {
    placement: 'bottom',
    disabled: false,
    default: 'Hover me'
  },
  render: (args) => ({
    components: { LfxTooltip, LfxButton },
    template: `
    <div style="height: 150px; display: flex; justify-content: center; align-items: center;">
      <lfx-tooltip :placement="${args.placement}" :disabled="${args.disabled}">
        <template #content>
          <h4 class="font-semibold">The quick brown fox jumps over the lazy dog</h4>
          <div>
            <p>Voluptates dolores eum fugiat odio fugiat enim id corrupti explicabo veritatis voluptatem libero.</p>
          </div>
        </template>
        <lfx-button>Hover me</lfx-button>
      </lfx-tooltip>
    </div>`
  })
};
