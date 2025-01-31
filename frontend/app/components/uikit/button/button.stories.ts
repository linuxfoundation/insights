import LfxButton from './button.vue';
import { buttonTypes, iconPosition } from './types/ButtonType';
import { buttonSizes } from './types/ButtonType';

export default {
  title: 'LinuxFoundation/Button',
  component: LfxButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'The label of the button',
      control: 'text'
    },
    icon: {
      description: 'The icon of the button (font-awesome icon)',
      control: 'text'
    },
    type: {
      description: 'The type of the button',
      control: 'select',
      options: buttonTypes
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: buttonSizes
    },
    iconPosition: {
      description: 'The position of the icon',
      control: 'select',
      options: iconPosition
    },
    loading: {
      description: 'Whether the button is loading',
      control: 'boolean'
    },
    disabled: {
      description: 'Whether the button is disabled',
      control: 'boolean'
    }
  },
  parameters: {
    backgrounds: {
      values: [
        { name: 'Dark', value: '#333' },
        { name: 'Light', value: '#F1F5F9' }
      ],
      default: 'Light'
    }
  }
};

export const Default = {
  label: 'Primary',
  args: {
    label: 'Button',
    type: 'primary',
    size: 'medium',
    loading: false
  }
};

export const Secondary = {
  label: 'Secondary',
  args: {
    label: 'Button',
    type: 'secondary',
    size: 'medium',
    loading: false
  }
};

export const Tertiary = {
  label: 'Tertiary',
  args: {
    label: 'Button',
    type: 'tertiary',
    size: 'medium',
    loading: false
  }
};

export const WithIcons = {
  label: 'Primary',
  args: {
    label: 'Button',
    type: 'primary',
    size: 'medium',
    loading: false,
    icon: 'fa-solid fa-chart-line',
    iconPosition: 'left'
  }
};
