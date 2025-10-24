// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxInput from '../input/input.vue';
import LfxTextarea from '../textarea/textarea.vue';
import LfxSelect from '../select/select.vue';
import LfxOption from '../select/option.vue';
import LfxFieldMessage from './field-message.vue';
import LfxField from './field.vue';

export default {
  title: 'LinuxFoundation/Field',
  component: LfxField,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label text for the field',
      control: 'text',
    },
    required: {
      description: 'Whether the field is required (shows asterisk)',
      defaultValue: false,
      control: 'boolean',
    },

    // Slots
    default: {
      description: 'Form control (input, select, textarea, etc.)',
      control: {
        type: null,
      },
    },
  },
};

export const WithInput = {
  args: {
    label: 'Email Address',
    required: true,
  },
  render: (args) => ({
    components: { LfxField, LfxInput, LfxFieldMessage },
    setup() {
      const email = ref('');
      return { args, email };
    },
    template: `
    <div class="w-96">
      <lfx-field v-bind="args">
        <lfx-input v-model="email" placeholder="Enter your email" />
      </lfx-field>
    </div>`,
  }),
};

export const WithTextarea = {
  args: {
    label: 'Description',
    required: false,
  },
  render: (args) => ({
    components: { LfxField, LfxTextarea },
    setup() {
      const description = ref('');
      return { args, description };
    },
    template: `
    <div class="w-96">
      <lfx-field v-bind="args">
        <lfx-textarea v-model="description" placeholder="Enter description..." style="min-height: 100px;" />
      </lfx-field>
    </div>`,
  }),
};

export const WithSelect = {
  args: {
    label: 'Country',
    required: true,
  },
  render: (args) => ({
    components: { LfxField, LfxSelect, LfxOption },
    setup() {
      const country = ref('');
      return { args, country };
    },
    template: `
    <div class="w-96">
      <lfx-field v-bind="args">
        <lfx-select v-model="country" placeholder="Select country">
          <lfx-option value="us" label="United States" />
          <lfx-option value="uk" label="United Kingdom" />
          <lfx-option value="ca" label="Canada" />
          <lfx-option value="de" label="Germany" />
        </lfx-select>
      </lfx-field>
    </div>`,
  }),
};

export const WithErrorMessage = {
  args: {
    label: 'Username',
    required: true,
  },
  render: (args) => ({
    components: { LfxField, LfxInput, LfxFieldMessage },
    setup() {
      const username = ref('ab');
      const isValid = computed(() => username.value.length >= 3);
      return { args, username, isValid };
    },
    template: `
    <div class="w-96">
      <lfx-field v-bind="args">
        <lfx-input v-model="username" :invalid="!isValid" placeholder="Enter username" />
        <lfx-field-message v-if="!isValid" type="error">
          Username must be at least 3 characters long
        </lfx-field-message>
      </lfx-field>
    </div>`,
  }),
};

export const WithHintMessage = {
  args: {
    label: 'Password',
    required: true,
  },
  render: (args) => ({
    components: { LfxField, LfxInput, LfxFieldMessage },
    setup() {
      const password = ref('');
      return { args, password };
    },
    template: `
    <div class="w-96">
      <lfx-field v-bind="args">
        <lfx-input v-model="password" type="password" placeholder="Enter password" />
        <lfx-field-message type="hint">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </lfx-field-message>
      </lfx-field>
    </div>`,
  }),
};

export const CompleteForm = {
  render: () => ({
    components: { LfxField, LfxInput, LfxTextarea, LfxSelect, LfxOption, LfxFieldMessage },
    setup() {
      const form = ref({
        name: '',
        email: '',
        country: '',
        message: '',
      });
      const emailValid = computed(
        () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) || form.value.email === '',
      );
      return { form, emailValid };
    },
    template: `
    <div class="w-96 space-y-4">
      <lfx-field label="Full Name" required>
        <lfx-input v-model="form.name" placeholder="John Doe" />
      </lfx-field>

      <lfx-field label="Email" required>
        <lfx-input v-model="form.email" :invalid="!emailValid" type="email" placeholder="john@example.com" />
        <lfx-field-message v-if="!emailValid" type="error">
          Please enter a valid email address
        </lfx-field-message>
      </lfx-field>

      <lfx-field label="Country" required>
        <lfx-select v-model="form.country" placeholder="Select country">
          <lfx-option value="us" label="United States" />
          <lfx-option value="uk" label="United Kingdom" />
          <lfx-option value="ca" label="Canada" />
        </lfx-select>
      </lfx-field>

      <lfx-field label="Message">
        <lfx-textarea v-model="form.message" placeholder="Your message..." style="min-height: 100px;" />
        <lfx-field-message type="hint">
          Optional: Tell us more about your inquiry
        </lfx-field-message>
      </lfx-field>
    </div>`,
  }),
};
