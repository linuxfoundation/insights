import LfxTag from './tag.vue';
import {tagSizes, tagStyles, tagTypes} from "./types/tag.types";

export default {
  title: 'LinuxFoundation/Tag',
  component: LfxTag,
  tags: ['autodocs'],
  argTypes: {
    style: {
      description: 'The style of the tag',
      control: 'select',
      options: tagStyles
    },
    size: {
      description: 'The size of the tag',
      control: 'select',
      options: tagSizes
    },
    type: {
      description: 'The type of the tag',
      control: 'select',
      options: tagTypes
    },

    // Slots
    default: {
      description: 'Text or html content of the tag',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  label: 'Primary',
  args: {
    default: 'I\'m tag content',
    style: 'default',
    size: 'medium',
    type: 'solid'
  }
};
