import LfxAvatar from './Avatar.vue';
import { avatarShapes, avatarSizes } from './types/Avatar.types';

export default {
  title: 'LinuxFoundation/Avatar',
  component: LfxAvatar,
  tags: ['autodocs'],
  argTypes: {
    name: {
      description: 'Name of the avatar',
      control: 'text'
    },
    size: {
      description: 'Size of the avatar',
      control: 'select',
      options: avatarSizes
    },
    shape: {
      description: 'Shape of the avatar',
      control: 'select',
      options: avatarShapes
    },
    src: {
      description: 'Source of the avatar',
      control: {
        type: 'text'
      }
    }
  }
};

export const Default = {
  args: {
    name: 'Sample Name',
    size: 'normal',
    shape: 'circle',
    src: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  }
};

export const TextOnly = {
  args: {
    name: 'Sample Name',
    size: 'normal',
    shape: 'circle'
  }
};

export const IconOnly = {
  args: {
    name: 'Sample Name',
    size: 'normal',
    shape: 'circle',
    icon: 'fa-solid fa-user',
    class: 'bg-brand-500'
  },
  render: (args) => ({
    components: { LfxAvatar },
    template: `<lfx-avatar name="${args.name}" size="${args.size}" 
      shape="${args.shape}" icon="${args.icon}" class="${args.class}" />`
  })
};
