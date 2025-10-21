// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxTextarea from './textarea.vue';

export default {
  title: 'LinuxFoundation/Textarea',
  component: LfxTextarea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Textarea value (string or number)',
      control: 'text',
    },
    placeholder: {
      description: 'Placeholder text',
      defaultValue: '',
      control: 'text',
    },
    disabled: {
      description: 'Whether the textarea is disabled',
      defaultValue: false,
      control: 'boolean',
    },
    invalid: {
      description: 'Whether the textarea has an error/invalid state',
      defaultValue: false,
      control: 'boolean',
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when value changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Enter your message...',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    components: { LfxTextarea },
    setup() {
      const text = ref('');
      return { args, text };
    },
    template: `
    <div class="w-96">
      <lfx-textarea
        v-model="text"
        v-bind="args"
        style="min-height: 120px;"
      />
      <p class="mt-2 text-sm text-neutral-500">Characters: {{ text.length }}</p>
    </div>`,
  }),
};

export const WithValue = {
  args: {
    placeholder: 'Enter your message...',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    components: { LfxTextarea },
    setup() {
      const text = ref('This is some pre-filled content in the textarea. You can edit it!');
      return { args, text };
    },
    template: `
    <div class="w-96">
      <lfx-textarea
        v-model="text"
        v-bind="args"
        style="min-height: 120px;"
      />
    </div>`,
  }),
};

export const Disabled = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
    invalid: false,
  },
  render: (args) => ({
    components: { LfxTextarea },
    setup() {
      const text = ref('This content cannot be edited');
      return { args, text };
    },
    template: `
    <div class="w-96">
      <lfx-textarea
        v-model="text"
        v-bind="args"
        style="min-height: 120px;"
      />
    </div>`,
  }),
};

export const Invalid = {
  args: {
    placeholder: 'Enter valid content...',
    disabled: false,
    invalid: true,
  },
  render: (args) => ({
    components: { LfxTextarea },
    setup() {
      const text = ref('This content is invalid');
      return { args, text };
    },
    template: `
    <div class="w-96">
      <lfx-textarea
        v-model="text"
        v-bind="args"
        style="min-height: 120px;"
      />
      <p class="mt-1 text-sm text-red-600">Please enter valid content</p>
    </div>`,
  }),
};

export const Large = {
  args: {
    placeholder: 'Write your essay here...',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    components: { LfxTextarea },
    setup() {
      const text = ref('');
      return { args, text };
    },
    template: `
    <div class="w-full">
      <lfx-textarea
        v-model="text"
        v-bind="args"
        style="min-height: 300px;"
      />
    </div>`,
  }),
};
