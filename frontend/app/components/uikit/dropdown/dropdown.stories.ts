// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Placement } from '@popperjs/core';
import LfxButton from '../button/button.vue';
import LfxDropdown from './dropdown.vue';
import LfxDropdownItem from './dropdown-item.vue';
import LfxDropdownSeparator from './dropdown-separator.vue';

export default {
  title: 'LinuxFoundation/Dropdown',
  component: LfxDropdown,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      description: 'Position of the dropdown relative to the trigger',
      control: 'select',
      options: [
        'top-start', 'top', 'top-end',
        'right-start', 'right', 'right-end',
        'bottom-start', 'bottom', 'bottom-end',
        'left-start', 'left', 'left-end'
      ]
    },
    width: {
      description: 'Width of the dropdown content',
      control: 'text'
    },
    visibility: {
      description: 'Controls dropdown visibility (v-model:visibility)',
      control: 'boolean'
    },
    matchWidth: {
      description: 'Whether dropdown should match the width of the trigger element',
      control: 'boolean'
    },
    dropdownClass: {
      description: 'Additional CSS classes for the dropdown container',
      control: 'text'
    }
  }
};

export const Default = {
  args: {
    placement: 'bottom-start' as Placement,
    width: '200px',
    matchWidth: false
  },
  render: (args) => ({
    components: {
      LfxDropdown,
      LfxDropdownItem,
      LfxDropdownSeparator,
      LfxButton
    },
    setup() {
      return { args };
    },
    template: `
    <div class="h-64">
      <lfx-dropdown v-bind="args">
        <template #trigger>
          <lfx-button>
            Open Dropdown
          </lfx-button>
        </template>

        <lfx-dropdown-item>Option 1</lfx-dropdown-item>
        <lfx-dropdown-item>Option 2</lfx-dropdown-item>
        <lfx-dropdown-separator />
        <lfx-dropdown-item>Option 3</lfx-dropdown-item>
      </lfx-dropdown>
    </div>`
  })
};

export const WithIcons = {
  args: {
    placement: 'bottom-start' as Placement,
    width: '250px',
    matchWidth: false
  },
  render: (args) => ({
    components: {
      LfxDropdown,
      LfxDropdownItem,
      LfxButton
    },
    setup() {
      return { args };
    },
    template: `
    <div class="h-64">
      <lfx-dropdown v-bind="args">
        <template #trigger>
          <lfx-button>
            Actions
          </lfx-button>
        </template>

        <lfx-dropdown-item>
          <i class="fa-light fa-pen mr-2"></i>
          Edit
        </lfx-dropdown-item>
        <lfx-dropdown-item>
          <i class="fa-light fa-copy mr-2"></i>
          Duplicate
        </lfx-dropdown-item>
        <lfx-dropdown-item>
          <i class="fa-light fa-trash mr-2"></i>
          Delete
        </lfx-dropdown-item>
      </lfx-dropdown>
    </div>`
  })
};

export const MatchWidth = {
  args: {
    placement: 'bottom-start' as Placement,
    matchWidth: true
  },
  render: (args) => ({
    components: {
      LfxDropdown,
      LfxDropdownItem,
      LfxButton
    },
    setup() {
      return { args };
    },
    template: `
    <div class="h-64">
      <lfx-dropdown v-bind="args">
        <template #trigger>
          <lfx-button style="width: 300px;">
            Wide Button - Dropdown Matches Width
          </lfx-button>
        </template>

        <lfx-dropdown-item>Short option</lfx-dropdown-item>
        <lfx-dropdown-item>Another option</lfx-dropdown-item>
        <lfx-dropdown-item>Third option</lfx-dropdown-item>
      </lfx-dropdown>
    </div>`
  })
};

export const DifferentPlacements = {
  args: {
    width: '200px',
    matchWidth: false
  },
  render: (args) => ({
    components: {
      LfxDropdown,
      LfxDropdownItem,
      LfxButton
    },
    setup() {
      return { args };
    },
    template: `
    <div class="flex items-center justify-center gap-4 h-96">
      <lfx-dropdown v-bind="args" placement="top">
        <template #trigger>
          <lfx-button>Top</lfx-button>
        </template>
        <lfx-dropdown-item>Option 1</lfx-dropdown-item>
        <lfx-dropdown-item>Option 2</lfx-dropdown-item>
      </lfx-dropdown>

      <lfx-dropdown v-bind="args" placement="bottom">
        <template #trigger>
          <lfx-button>Bottom</lfx-button>
        </template>
        <lfx-dropdown-item>Option 1</lfx-dropdown-item>
        <lfx-dropdown-item>Option 2</lfx-dropdown-item>
      </lfx-dropdown>

      <lfx-dropdown v-bind="args" placement="left">
        <template #trigger>
          <lfx-button>Left</lfx-button>
        </template>
        <lfx-dropdown-item>Option 1</lfx-dropdown-item>
        <lfx-dropdown-item>Option 2</lfx-dropdown-item>
      </lfx-dropdown>

      <lfx-dropdown v-bind="args" placement="right">
        <template #trigger>
          <lfx-button>Right</lfx-button>
        </template>
        <lfx-dropdown-item>Option 1</lfx-dropdown-item>
        <lfx-dropdown-item>Option 2</lfx-dropdown-item>
      </lfx-dropdown>
    </div>`
  })
};
