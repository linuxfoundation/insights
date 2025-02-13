import LfxProgressBar from './progress-bar.vue';

export default {
  title: 'LinuxFoundation/ProgressBar',
  component: LfxProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Value of the progress bar',
      control: 'number'
    },
    color: {
      description: 'Color of the progress bar',
      control: 'select',
      options: ['normal', 'positive', 'warning', 'negative']
    }
  }
};

export const Default = {
  args: {
    value: 50,
    color: 'normal'
  }
};
