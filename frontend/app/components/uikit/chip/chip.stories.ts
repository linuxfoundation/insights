import { avatarTypes } from '../avatar/types/Avatar.types';
import LfxChip from './chip.vue';
import { chipSizes, chipTypes } from './types/chip.types';

export default {
  title: 'LinuxFoundation/Chip',
  component: LfxChip,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label of the chip',
      control: 'text'
    },
    size: {
      description: 'Size of the chip',
      control: 'select',
      options: chipSizes
    },
    type: {
      description: 'Type of the chip',
      control: 'select',
      options: chipTypes
    },
    icon: {
      description: 'Icon of the chip',
      control: 'text'
    },
    image: {
      description: 'Image of the chip (for Member or Organization)',
      control: 'text'
    },
    avatarType: {
      description: 'Type of the avatar (for Member or Organization)',
      control: 'select',
      options: avatarTypes
    },
    removable: {
      description: 'Whether the chip is removable',
      control: 'boolean'
    }
  }
};

export const Default = {
  args: {
    label: 'Chip',
    size: 'normal'
  }
};

export const Dark = {
  args: {
    label: 'Chip',
    size: 'normal',
    type: 'dark'
  }
};

export const Small = {
  args: {
    label: 'Chip',
    size: 'small'
  }
};

export const WithIcon = {
  args: {
    label: 'Chip with icon',
    size: 'normal',
    icon: 'fa-regular fa-circle-info'
  }
};

export const WithAvatar = {
  args: {
    label: 'Chip with Avatar',
    size: 'normal',
    image: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  }
};

export const WithLogo = {
  args: {
    label: 'Chip with Logo',
    size: 'normal',
    avatarType: 'organization',
    image: 'https://static-00.iconduck.com/assets.00/linux-icon-256x256-773o7tyd.png'
  }
};

export const Dismissable = {
  args: {
    label: 'Chip dismissable',
    size: 'normal',
    removable: true
  }
};
