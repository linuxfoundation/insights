import { iconTypes } from '../icon/types/icon.types';
import LfxDeltaDisplay from './delta-display.vue';

export default {
  title: 'LinuxFoundation/DeltaDisplay',
  component: LfxDeltaDisplay,
  tags: ['autodocs'],
  argTypes: {
    // Props
    current: {
      description: 'Specifies current value',
      defaultValue: 0,
      control: 'number'
    },
    previous: {
      description: 'Specifies previous value',
      defaultValue: 0,
      control: 'number'
    },
    isReverse: {
      description: 'Specifies if the delta is reverse',
      defaultValue: false,
      control: 'boolean'
    },
    icon: {
      description: 'Specifies icon name',
      defaultValue: 'circle-arrow-up-right',
      control: 'text'
    },
    iconType: {
      description: 'Specifies icon type',
      defaultValue: 'solid',
      control: 'select',
      options: iconTypes
    }
  }
};

export const Default = {
  args: {
    current: 100,
    previous: 85,
    icon: 'circle-arrow-up-right',
    iconType: 'solid'
  }
};

export const Reverse = {
  args: {
    ...Default.args,
    isReverse: true
  }
};
