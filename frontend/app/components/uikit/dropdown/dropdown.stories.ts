import LfxDropdown from './dropdown.vue';
import { dropdownTypes, dropdownSizes } from './types/dropdown.types';

export default {
  title: 'LinuxFoundation/Dropdown',
  component: LfxDropdown,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'The model value of the dropdown',
      control: 'text'
    },
    options: {
      description: 'The options of the dropdown',
      control: 'object'
    },
    placeholder: {
      description: 'The placeholder of the dropdown',
      control: 'text'
    },
    disabled: {
      description: 'Whether the dropdown is disabled',
      control: 'boolean'
    },
    type: {
      description: 'The type of the dropdown',
      control: 'select',
      options: dropdownTypes
    },
    size: {
      description: 'The size of the dropdown',
      control: 'select',
      options: dropdownSizes
    },
    showGroupBreaks: {
      description: 'Whether to show group breaks',
      control: 'boolean'
    },
    showFilter: {
      description: 'Whether to show the filter',
      control: 'boolean'
    }
  }
};

export const Default = {
  args: {
    options: [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
      { label: 'Option 3', value: 'option-3' }
    ],
    type: 'filled',
    size: 'default',
    modelValue: 'option-1'
  },
  render: (args) => ({
    components: {
      LfxDropdown
    },
    setup() {
      return { args };
    },
    template: `
    <div class="flex flex-row gap-4" style="height: 150px;">
      <div class="w-1/2">
        <LfxDropdown v-bind="args" />
      </div>
    </div>`
  })
};

export const CustomOptionTemplate = {
  args: {
    ...Default.args,
    options: [
      {
        label: 'Option Custom 1',
        value: 'option-custom-1',
        description: 'Option Custom 1 Description. lorem ipsum dolor sit amet.'
      },
      {
        label: 'Option Custom 2',
        value: 'option-custom-2',
        description: 'Option Custom 2 Description. lorem ipsum dolor sit amet.'
      },
      {
        label: 'Option Custom 3',
        value: 'option-custom-3',
        description: 'Option Custom 3 Description. lorem ipsum dolor sit amet.'
      }
    ],
    optionTemplate: '<i class="fa-light fa-face-smile"></i> {{ option.label }}',
    modelValue: 'option-custom-1'
  },
  render: (args) => ({
    components: {
      LfxDropdown
    },
    setup() {
      return { args };
    },
    template: `
    <div class="flex flex-row gap-4" style="height: 300px;">
      <div class="w-1/2">
        <LfxDropdown v-bind="args">
          <template #optionTemplate="{ option }">
            <span class="flex gap-2 items-center">
              <i class="fa-light fa-face-smile"></i> {{ option.label }}
            </span>
            <div class="text-xs text-neutral-500">{{ option.description }}</div>
          </template>
        </LfxDropdown>
      </div>
    </div>`
  })
};

export const GroupedOptions = {
  args: {
    ...Default.args,
    options: [
      {
        label: 'Group 1',
        items: [
          { label: 'Option 1', value: 'option-1' },
          { label: 'Option 2', value: 'option-2' }
        ]
      },
      {
        label: 'Group 2',
        items: [
          { label: 'Option 3', value: 'option-3' },
          { label: 'Option 4', value: 'option-4' }
        ]
      }
    ]
  },
  render: (args) => ({
    components: {
      LfxDropdown
    },
    setup() {
      return { args };
    },
    template: `
    <div class="flex flex-row gap-4" style="height: 250px;">
      <div class="w-1/2">
        <LfxDropdown v-bind="args" />
      </div>
    </div>`
  })
};

export const WithFilter = {
  args: {
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Date', value: 'date' },
      { label: 'Elderberry', value: 'elderberry' },
      { label: 'Fig', value: 'fig' }
    ],
    type: 'filled',
    size: 'default',
    modelValue: 'apple',
    showFilter: true
  },
  render: (args) => ({
    components: {
      LfxDropdown
    },
    setup() {
      return { args };
    },
    template: `
    <div class="flex flex-row gap-4" style="height: 300px;">
      <div class="w-1/2">
        <LfxDropdown v-bind="args" />
      </div>
    </div>`
  })
};
