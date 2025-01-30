import LfxAvatar from './Avatar.vue';

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
      options: ['xlarge', 'large', 'normal']
    },
    shape: {
      description: 'Shape of the avatar',
      control: 'select',
      options: ['circle', 'square']
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
  label: 'Primary',
  args: {
    name: 'Sample Name',
    size: 'normal',
    shape: 'circle',
    src: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  }
};

export const TextOnly = {
  label: 'Primary',
  args: {
    name: 'Sample Name',
    size: 'normal',
    shape: 'circle',
    class: 'bg-brand-500'
  }
};
