// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxAccordion from './accordion.vue';
import LfxAccordionItem from './accordion-item.vue';

export default {
  title: 'LinuxFoundation/Accordion',
  component: LfxAccordion,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Currently opened accordion item name (v-model)',
      control: 'text',
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when opened item changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  render: () => ({
    components: { LfxAccordion, LfxAccordionItem },
    setup() {
      const openItem = ref('');
      return { openItem };
    },
    template: `
    <div class="w-full max-w-2xl">
      <lfx-accordion v-model="openItem">
        <lfx-accordion-item name="item1">
          <template #default>
            <h3 class="text-lg font-semibold">What is Insights?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Insights evaluates the health and trustworthiness of the world's most
              critical open source software. It provides comprehensive metrics and
              analytics to help you understand project activity, contributor engagement,
              and overall ecosystem health.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="item2">
          <template #default>
            <h3 class="text-lg font-semibold">How does it work?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Insights aggregates data from multiple sources including GitHub, package
              registries, and community platforms. It then processes this data to provide
              meaningful metrics about project health, contributor activity, and software
              value.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="item3">
          <template #default>
            <h3 class="text-lg font-semibold">Who can use it?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Insights is available to everyone! Whether you're a developer, maintainer,
              enterprise user, or open source enthusiast, you can access project metrics
              and analytics to make informed decisions about the software you use and
              contribute to.
            </div>
          </template>
        </lfx-accordion-item>
      </lfx-accordion>
      <p class="mt-4 text-sm text-neutral-500">Open item: {{ openItem || 'none' }}</p>
    </div>`,
  }),
};

export const Preselected = {
  render: () => ({
    components: { LfxAccordion, LfxAccordionItem },
    setup() {
      const openItem = ref('faq2');
      return { openItem };
    },
    template: `
    <div class="w-full max-w-2xl">
      <lfx-accordion v-model="openItem">
        <lfx-accordion-item name="faq1">
          <template #default>
            <h3 class="text-lg font-semibold">Is it free?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Yes, the basic features of Insights are free to use for everyone.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="faq2">
          <template #default>
            <h3 class="text-lg font-semibold">What data sources do you use?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              We aggregate data from GitHub, package registries, social media, mailing
              lists, and other public sources to provide comprehensive insights into
              open source projects.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="faq3">
          <template #default>
            <h3 class="text-lg font-semibold">How often is data updated?</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Data is updated daily to ensure you always have access to the most recent metrics and analytics.
            </div>
          </template>
        </lfx-accordion-item>
      </lfx-accordion>
    </div>`,
  }),
};

export const Reverse = {
  render: () => ({
    components: { LfxAccordion, LfxAccordionItem },
    setup() {
      const openItem = ref('');
      return { openItem };
    },
    template: `
    <div class="w-full max-w-2xl">
      <lfx-accordion v-model="openItem">
        <lfx-accordion-item name="step1" reverse>
          <template #default>
            <h3 class="text-lg font-semibold">Step 1: Installation</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              First, install the required dependencies using your package manager.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="step2" reverse>
          <template #default>
            <h3 class="text-lg font-semibold">Step 2: Configuration</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Next, configure your application settings in the config file.
            </div>
          </template>
        </lfx-accordion-item>

        <lfx-accordion-item name="step3" reverse>
          <template #default>
            <h3 class="text-lg font-semibold">Step 3: Run</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              Finally, start your application and verify everything works correctly.
            </div>
          </template>
        </lfx-accordion-item>
      </lfx-accordion>
    </div>`,
  }),
};

export const ManyItems = {
  render: () => ({
    components: { LfxAccordion, LfxAccordionItem },
    setup() {
      const openItem = ref('');
      const items = Array.from({ length: 8 }, (_, i) => ({
        name: `item${i + 1}`,
        title: `Section ${i + 1}`,
        content: `This is the content for section ${i + 1}. It can contain any information you need to display.`
      }));
      return { openItem, items };
    },
    template: `
    <div class="w-full max-w-2xl">
      <lfx-accordion v-model="openItem">
        <lfx-accordion-item
          v-for="item in items"
          :key="item.name"
          :name="item.name"
        >
          <template #default>
            <h3 class="text-lg font-semibold">{{ item.title }}</h3>
          </template>
          <template #content>
            <div class="pt-4 text-neutral-600">
              {{ item.content }}
            </div>
          </template>
        </lfx-accordion-item>
      </lfx-accordion>
    </div>`,
  }),
};
