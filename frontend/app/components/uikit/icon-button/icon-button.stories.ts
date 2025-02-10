import LfxIconButton from './icon-button.vue';
import { iconButtonSizes, iconButtonTypes } from './types/icon-button.types';

export default {
  title: 'LinuxFoundation/IconButton',
  component: LfxIconButton,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'The icon of the button (font-awesome icon)',
      control: 'text'
    },
    type: {
      description: 'The type of the button',
      control: 'select',
      options: iconButtonTypes
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: iconButtonSizes
    },
    disabled: {
      description: 'Whether the button is disabled',
      control: 'boolean'
    }
  },
};

export const Default = {
  args: {
    type: 'default',
    size: 'medium',
    icon: 'compass',
    disabled: false,
  }
};

export const Transparent = {
  args: {
    type: 'transparent',
    size: 'medium',
    icon: 'compass',
    disabled: false,
  }
};
