import LfxTabs from './tabs.vue';

export default {
  title: 'LinuxFoundation/Tabs',
  component: LfxTabs,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'The currently selected tab value',
      control: 'text'
    },
    tabs: {
      description: 'The tabs to display',
      control: 'object'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `Note: The tabs component takes on the width of the parent container.`
      }
    }
  }
};

export const Default = {
  label: 'Primary',
  args: {
    modelValue: '1',
    tabs: [
      { value: '1', label: 'Tab 1' },
      { value: '2', label: 'Tab 2' },
      { value: '3', label: 'Tab 3' }
    ]
  }
};

const iconsOnlyTmpl = `<div class="p-4 bg-white flex">
      <lfx-tabs v-bind="propsObj" />
    </div>`;

export const IconsOnly = {
  label: 'Icons Only',
  args: {
    modelValue: '1',
    tabs: [
      { value: '1', label: 'Tab 1', icon: 'fa-solid fa-chart-line' },
      { value: '2', label: 'Tab 2', icon: 'fa-solid fa-chart-bar' },
      { value: '3', label: 'Tab 3', icon: 'fa-solid fa-chart-scatter' }
    ]
  },
  render: (args, { argTypes }) => ({
    components: { LfxTabs },
    props: Object.keys(argTypes),
    template: iconsOnlyTmpl,
    computed: {
      propsObj() {
        return args;
      }
    }
  })
};

const customTmpl = `
  <div class="p-4 bg-white flex">
    <lfx-tabs v-bind="propsObj">
      <template #slotItem="{ option }">
        <i :class="option.icon"></i>
        {{ option.label }}
      </template>
    </lfx-tabs>
  </div>`;

export const CustomTemplate = {
  label: 'Icons Only',
  args: {
    modelValue: '1',
    tabs: [
      { value: '1', label: 'Tab 1', icon: 'fa-solid fa-chart-line' },
      { value: '2', label: 'Tab 2', icon: 'fa-solid fa-chart-bar' },
      { value: '3', label: 'Tab 3', icon: 'fa-solid fa-chart-scatter' }
    ]
  },
  render: (args, { argTypes }) => ({
    components: { LfxTabs },
    props: Object.keys(argTypes),
    template: customTmpl,
    computed: {
      propsObj() {
        return args;
      }
    }
  }),
  parameters: {
    docs: {
      source: {
        code: `<script lang="ts" setup>
  import { ref } from "vue";

  const modelValue = ref("1");

  const tabs = [
    {
      "value": "1",
      "label": "Tab 1",
      "icon": "fa-solid fa-chart-line"
    },
    {
      "value": "2",
      "label": "Tab 2",
      "icon": "fa-solid fa-chart-bar"
    },
    {
      "value": "3",
      "label": "Tab 3",
      "icon": "fa-solid fa-chart-scatter"
    }
  ];
</script>

<template>
  ${customTmpl}
</template>`
      }
    }
  }
};
