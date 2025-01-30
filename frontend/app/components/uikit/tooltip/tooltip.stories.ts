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
      description: 'Value for radio when selected',
      control: 'text'
    },
    disabled: {
      description: 'Specifies if tooltip is hidden',
      defaultValue: false,
      control: 'boolean'
    },

    // Slots
    default: {
      description: 'Text or html content of the radio',
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
  }
};

export const CustomContent = {
  label: 'Custom Content',
  args: {
    placement: 'bottom',
    disabled: false,
    default: 'Hover me'
  },
  render: (args) => ({
    components: { LfxTooltip },
    template: `<lfx-tooltip placement="${args.placement}">
      <template #content>
        <h4>Header In Tooltip</h4>
        <div>
          <p>Custom content</p>
        </div>
      </template>
      <span>Hover me</span>
    </lfx-tooltip>`
  })
};
