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
      { label: 'Option Custom 1', value: 'option-custom-1' },
      { label: 'Option Custom 2', value: 'option-custom-2' },
      { label: 'Option Custom 3', value: 'option-custom-3' }
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
    <div class="flex flex-row gap-4" style="height: 150px;">
      <div class="w-1/2">
        <LfxDropdown v-bind="args">
          <template #optionTemplate="{ option }">
            <span class="flex gap-2 items-center">
              <i class="fa-light fa-face-smile"></i> {{ option.label }}
            </span>
          </template>
        </LfxDropdown>
      </div>
    </div>`
  })
};
