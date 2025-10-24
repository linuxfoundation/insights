// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxButton from '../button/button.vue';
import LfxToast from './toast.vue';
import useToastService from './toast.service';
import type { ToastType } from './types/toast.types';
import { ToastTypesEnum } from './types/toast.types';

export default {
  title: 'LinuxFoundation/Toast',
  tags: ['autodocs'],
  argTypes: {
    message: {
      description: 'Message of the toast',
      control: 'text',
    },
    // removing this as part of the argument because we cannot make this interactive
    // Adding the <Toast /> component multiple times will result in duplicate toast messages
    // toastType: {
    //   description: 'The type of the toast',
    //   control: 'select',
    //   options: toastTypes
    // },
    delay: {
      description: 'Delay of the toast',
      control: 'number',
    },
  },
};

const render = (args) => ({
  components: { LfxButton, LfxToast },
  setup() {
    const { showToast } = useToastService();
    const displayToast = (toastType: ToastType, icon?: string) => {
      showToast(args.message, toastType, icon, args.delay);
    };
    const typesEnum = ToastTypesEnum;
    const theme = 'dark';
    return {
      args,
      displayToast,
      typesEnum,
      theme,
    };
  },
  template: `
    <div>
      <lfx-toast :theme="theme" /> <!-- Ensure Toast is rendered -->
      <div class="flex flex-row gap-2">
        <lfx-button label="Show Default" @click="displayToast(typesEnum.default)" />
        <lfx-button label="Show Info" @click="displayToast(typesEnum.info)" />
        <lfx-button label="Show Positive" @click="displayToast(typesEnum.positive)" />
        <lfx-button label="Show Warning" @click="displayToast(typesEnum.warning)" />
        <lfx-button label="Show Negative" @click="displayToast(typesEnum.negative)" />
        <lfx-button label="Show Custom Icon" @click="displayToast(typesEnum.default, 'fa-solid fa-face-smile')" />
      </div>
    </div>
  `,
});

export const Default = {
  args: {
    message: 'This is a toast message',
    delay: 3000,
  },
  render,
};
