// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxSelect from './select.vue';
import LfxOption from './option.vue';

export default {
  title: 'LinuxFoundation/Select',
  component: LfxSelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'The selected value (v-model)',
      control: 'text',
    },
    placeholder: {
      description: 'Placeholder text shown when no option is selected',
      control: 'text',
    },

    // Slots
    default: {
      description: 'Options to display in the select (use lfx-option components)',
      control: {
        type: null,
      },
    },
    prefix: {
      description: 'Prefix content (icons, badges, etc.) shown before the selected value',
      control: {
        type: null,
      },
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when selection changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Select an option',
  },
  render: (args) => ({
    components: { LfxSelect, LfxOption },
    setup() {
      const selected = ref('');
      return { args, selected };
    },
    template: `
    <div class="w-64">
      <lfx-select v-model="selected" :placeholder="args.placeholder">
        <lfx-option value="option1" label="Option 1" />
        <lfx-option value="option2" label="Option 2" />
        <lfx-option value="option3" label="Option 3" />
      </lfx-select>
      <p class="mt-4 text-sm text-neutral-500">Selected: {{ selected || 'none' }}</p>
    </div>`,
  }),
};

export const WithPreselected = {
  args: {
    placeholder: 'Select an option',
  },
  render: (args) => ({
    components: { LfxSelect, LfxOption },
    setup() {
      const selected = ref('option2');
      return { args, selected };
    },
    template: `
    <div class="w-64">
      <lfx-select v-model="selected" :placeholder="args.placeholder">
        <lfx-option value="option1" label="First Option" />
        <lfx-option value="option2" label="Second Option" />
        <lfx-option value="option3" label="Third Option" />
      </lfx-select>
    </div>`,
  }),
};

export const ManyOptions = {
  args: {
    placeholder: 'Choose a fruit',
  },
  render: (args) => ({
    components: { LfxSelect, LfxOption },
    setup() {
      const selected = ref('');
      const fruits = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'cherry', label: 'Cherry' },
        { value: 'date', label: 'Date' },
        { value: 'elderberry', label: 'Elderberry' },
        { value: 'fig', label: 'Fig' },
        { value: 'grape', label: 'Grape' },
        { value: 'honeydew', label: 'Honeydew' },
      ];
      return { args, selected, fruits };
    },
    template: `
    <div class="w-64">
      <lfx-select v-model="selected" :placeholder="args.placeholder">
        <lfx-option
          v-for="fruit in fruits"
          :key="fruit.value"
          :value="fruit.value"
          :label="fruit.label"
        />
      </lfx-select>
    </div>`,
  }),
};

export const WithPrefix = {
  args: {
    placeholder: 'Select status',
  },
  render: (args) => ({
    components: { LfxSelect, LfxOption },
    setup() {
      const selected = ref('active');
      return { args, selected };
    },
    template: `
    <div class="w-64">
      <lfx-select v-model="selected" :placeholder="args.placeholder">
        <template #prefix="{ selectedOption }">
          <span
            class="w-2 h-2 rounded-full mr-2"
            :class="{
              'bg-green-500': selectedOption.value === 'active',
              'bg-yellow-500': selectedOption.value === 'pending',
              'bg-red-500': selectedOption.value === 'inactive',
            }"
          />
        </template>
        <lfx-option value="active" label="Active" />
        <lfx-option value="pending" label="Pending" />
        <lfx-option value="inactive" label="Inactive" />
      </lfx-select>
    </div>`,
  }),
};
