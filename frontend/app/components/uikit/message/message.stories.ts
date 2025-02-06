import LfxMessage from './message.vue';
import { messageSizes, messageStyles, messageTypes } from './types/message.types';

export default {
  title: 'LinuxFoundation/Message',
  component: LfxMessage,
  tags: ['autodocs'],
  argTypes: {
    message: {
      description: 'Message of the message',
      control: 'text'
    },
    messageStyle: {
      description: 'Style of the message',
      control: 'select',
      options: messageStyles
    },
    size: {
      description: 'Size of the message',
      control: 'select',
      options: messageSizes
    },
    type: {
      description: 'Type of the message',
      control: 'select',
      options: messageTypes
    },
    icon: {
      description: 'Icon of the message (only for default style)',
      control: 'text'
    },

    // Slots
    default: {
      description: 'Text or html content of the message',
      control: {
        type: null
      }
    }
  }
};

export const Default = {
  args: {
    message: 'The quick brown fox jumps over the lazy dog',
    default: `Nemo doloribus in explicabo sit adipisci repudiandae nostrum est. Sed doloribus quasi in 
      dignissimos nulla omnis omnis et voluptatem voluptatem atque alias rerum. Soluta iusto fugit
      voluptatem expedita atque illo labore eos tempore doloremque optio qui sit. Facere natus neque 
      eos et delectus commodi rerum aut autem odio et sint nam.`,
    messageStyle: 'default',
    size: 'default',
    type: 'box'
  }
};

export const Info = {
  args: {
    ...Default.args,
    messageStyle: 'info'
  }
};

export const Positive = {
  args: {
    ...Default.args,
    messageStyle: 'positive'
  }
};

export const Warning = {
  args: {
    ...Default.args,
    messageStyle: 'warning'
  }
};

export const Negative = {
  args: {
    ...Default.args,
    messageStyle: 'negative'
  }
};

export const Small = {
  args: {
    ...Default.args,
    messageStyle: 'info',
    size: 'small'
  }
};

export const Transparent = {
  args: {
    ...Default.args,
    messageStyle: 'info',
    type: 'transparent'
  }
};
