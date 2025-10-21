// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ref } from 'vue';
import LfxButton from '../button/button.vue';
import LfxDrawer from './drawer.vue';

export default {
  title: 'LinuxFoundation/Drawer',
  component: LfxDrawer,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Drawer open state (v-model)',
      control: 'boolean',
    },
    width: {
      description: 'Maximum width of the drawer',
      defaultValue: '37.5rem',
      control: 'text',
    },
    position: {
      description: 'Position of the drawer (left or right side)',
      defaultValue: 'right',
      control: 'select',
      options: ['left', 'right'],
    },
    closeFunction: {
      description: 'Function that validates/prevents drawer from closing (must return boolean)',
      control: {
        type: null,
      },
    },

    // Slots
    default: {
      description: 'Content of the drawer (receives close function as slot prop)',
      control: {
        type: null,
      },
    },

    // Events
    'update:modelValue': {
      description: 'Event triggered when drawer open state changes',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  args: {
    width: '37.5rem',
    position: 'right',
  },
  render: (args) => ({
    components: { LfxDrawer, LfxButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
    <div>
      <lfx-button @click="isOpen = true">Open Drawer</lfx-button>
      <lfx-drawer v-model="isOpen" v-bind="args">
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-4">Drawer Title</h2>
          <p class="text-neutral-600 mb-4">
            This is the drawer content. You can put any content here.
            The drawer can be closed by clicking outside, pressing ESC, or clicking the X button.
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Field 1</label>
              <input type="text" class="w-full border rounded px-3 py-2" placeholder="Enter value..." />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Field 2</label>
              <input type="text" class="w-full border rounded px-3 py-2" placeholder="Enter value..." />
            </div>
          </div>
        </div>
      </lfx-drawer>
    </div>`,
  }),
};

export const LeftPosition = {
  args: {
    width: '30rem',
    position: 'left',
  },
  render: (args) => ({
    components: { LfxDrawer, LfxButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
    <div>
      <lfx-button @click="isOpen = true">Open Left Drawer</lfx-button>
      <lfx-drawer v-model="isOpen" v-bind="args">
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-4">Navigation Menu</h2>
          <nav class="space-y-2">
            <a href="#" class="block px-4 py-2 rounded hover:bg-neutral-100">Dashboard</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-neutral-100">Projects</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-neutral-100">Analytics</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-neutral-100">Settings</a>
          </nav>
        </div>
      </lfx-drawer>
    </div>`,
  }),
};

export const Wide = {
  args: {
    width: '60rem',
    position: 'right',
  },
  render: (args) => ({
    components: { LfxDrawer, LfxButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
    <div>
      <lfx-button @click="isOpen = true">Open Wide Drawer</lfx-button>
      <lfx-drawer v-model="isOpen" v-bind="args">
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-4">Wide Content</h2>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold mb-2">Column 1</h3>
              <p class="text-neutral-600">
                This drawer is wider and can accommodate more content side by side.
              </p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Column 2</h3>
              <p class="text-neutral-600">
                Perfect for detailed forms or multi-column layouts.
              </p>
            </div>
          </div>
        </div>
      </lfx-drawer>
    </div>`,
  }),
};

export const WithCloseFunction = {
  args: {
    width: '37.5rem',
    position: 'right',
  },
  render: (args) => ({
    components: { LfxDrawer, LfxButton },
    setup() {
      const isOpen = ref(false);
      const hasUnsavedChanges = ref(false);

      const handleClose = () => {
        if (hasUnsavedChanges.value) {
          return confirm('You have unsaved changes. Are you sure you want to close?');
        }
        return true;
      };

      return { args, isOpen, hasUnsavedChanges, handleClose };
    },
    template: `
    <div>
      <lfx-button @click="isOpen = true">Open Drawer with Confirmation</lfx-button>
      <lfx-drawer v-model="isOpen" v-bind="args" :close-function="handleClose">
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-4">Form with Unsaved Changes</h2>
          <p class="text-neutral-600 mb-4">
            Try to close this drawer after typing. You'll be asked to confirm.
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                class="w-full border rounded px-3 py-2"
                placeholder="Type something..."
                @input="hasUnsavedChanges = true"
              />
            </div>
            <p class="text-sm text-neutral-500">
              Has unsaved changes: {{ hasUnsavedChanges ? 'Yes' : 'No' }}
            </p>
          </div>
        </div>
      </lfx-drawer>
    </div>`,
  }),
};

export const WithSlotProps = {
  args: {
    width: '37.5rem',
    position: 'right',
  },
  render: (args) => ({
    components: { LfxDrawer, LfxButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
    <div>
      <lfx-button @click="isOpen = true">Open Drawer</lfx-button>
      <lfx-drawer v-model="isOpen" v-bind="args">
        <template #default="{ close }">
          <div class="p-8">
            <h2 class="text-2xl font-bold mb-4">Drawer with Close Button</h2>
            <p class="text-neutral-600 mb-6">
              This drawer demonstrates using the close function from slot props.
            </p>
            <div class="flex gap-3">
              <lfx-button type="primary" @click="close">Save & Close</lfx-button>
              <lfx-button type="secondary" @click="close">Cancel</lfx-button>
            </div>
          </div>
        </template>
      </lfx-drawer>
    </div>`,
  }),
};
