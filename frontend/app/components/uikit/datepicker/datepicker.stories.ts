// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxDatepicker from './datepicker.vue';

export default {
  title: 'LinuxFoundation/Datepicker',
  component: LfxDatepicker,
  tags: ['autodocs'],
  argTypes: {
    // Note: This component is a wrapper around PrimeVue's DatePicker
    // All PrimeVue DatePicker props are supported via v-bind="$attrs"
    // For full documentation, see: https://primevue.org/datepicker/
  },
};

export const Default = {
  render: () => ({
    components: { LfxDatepicker },
    setup() {
      const date = ref(null);
      return { date };
    },
    template: `
    <div class="space-y-4">
      <lfx-datepicker v-model="date" placeholder="Select a date" />
      <p class="text-sm text-neutral-500">Selected: {{ date || 'none' }}</p>
    </div>`,
  }),
};

export const WithPreselected = {
  render: () => ({
    components: { LfxDatepicker },
    setup() {
      const date = ref(new Date());
      return { date };
    },
    template: `
    <div class="space-y-4">
      <lfx-datepicker v-model="date" />
      <p class="text-sm text-neutral-500">Selected: {{ date }}</p>
    </div>`,
  }),
};

export const DateRange = {
  render: () => ({
    components: { LfxDatepicker },
    setup() {
      const dates = ref(null);
      return { dates };
    },
    template: `
    <div class="space-y-4">
      <lfx-datepicker v-model="dates" selection-mode="range" placeholder="Select date range" />
      <p class="text-sm text-neutral-500">Selected: {{ dates || 'none' }}</p>
    </div>`,
  }),
};

export const MultipleDates = {
  render: () => ({
    components: { LfxDatepicker },
    setup() {
      const dates = ref(null);
      return { dates };
    },
    template: `
    <div class="space-y-4">
      <lfx-datepicker v-model="dates" selection-mode="multiple" placeholder="Select multiple dates" />
      <p class="text-sm text-neutral-500">Selected dates: {{ dates?.length || 0 }}</p>
    </div>`,
  }),
};

export const WithTime = {
  render: () => ({
    components: { LfxDatepicker },
    setup() {
      const datetime = ref(null);
      return { datetime };
    },
    template: `
    <div class="space-y-4">
      <lfx-datepicker v-model="datetime" show-time placeholder="Select date and time" />
      <p class="text-sm text-neutral-500">Selected: {{ datetime || 'none' }}</p>
    </div>`,
  }),
};
