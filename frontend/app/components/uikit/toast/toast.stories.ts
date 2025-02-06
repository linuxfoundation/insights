import LfxToastTester from './toast-tester.vue';

export default {
  title: 'LinuxFoundation/Toast',
  component: LfxToastTester,
  tags: ['autodocs'],
  argTypes: {
    message: {
      description: 'Message of the toast',
      control: 'text'
    },
    delay: {
      description: 'Delay of the toast',
      control: 'number'
    }
  },
  parameters: {
    docs: {
      source: {
        code: `
<template>
  <!-- must be added to the root component -->
  <lfx-toast theme="light" />

  <div>
    <lfx-button label="Show Toast" @click="showToast" />
  </div>
</template>
<script setup lang="ts">
import LfxButton from '../button/button.vue';
import LfxToast from './toast.vue';
import ToastService from './toast.service';
const toastService = new ToastService();

const showToast = () => {
  toastService.showToast('This is a toast message', 'info', 'fa-solid fa-compass');
};
</script>
`
      }
    }
  }
};

export const Default = {
  args: {
    message: 'This is a toast message',
    delay: 3000
  }
};
