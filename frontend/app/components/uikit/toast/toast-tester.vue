<!-- THIS IS JUST A TESTING COMPONENT FOR THE TOAST ON STORYBOOK -->
<template>
  <!-- must be added to the root component -->
  <lfx-toast :theme="theme" />

  <div class="flex flex-row gap-2">
    <lfx-button label="Show Default" @click="showToast(ToastTypesEnum.default)" />
    <lfx-button label="Show Info" @click="showToast(ToastTypesEnum.info)" />
    <lfx-button label="Show Positive" @click="showToast(ToastTypesEnum.positive)" />
    <lfx-button label="Show Warning" @click="showToast(ToastTypesEnum.warning)" />
    <lfx-button label="Show Negative" @click="showToast(ToastTypesEnum.negative)" />
    <lfx-button label="Show Custom Icon" @click="showToast(ToastTypesEnum.default, 'fa-solid fa-face-smile')" />
  </div>

  <br>
  <br>
  <lfx-button :label="`Change Theme - ${theme}`" @click="changeTheme" />
</template>

<script setup lang="ts">
import LfxButton from '../button/button.vue';
import LfxToast from './toast.vue';
import ToastService from './toast.service';
import type { ToastTheme, ToastType } from './types/toast.types';
import { ToastTypesEnum } from './types/toast.types';

const props = withDefaults(
  defineProps<{
    message: string;
    delay?: number;
  }>(),
  {
    theme: 'light',
    message: 'This is a toast message',
    delay: 3000
  }
);

const theme = ref<ToastTheme>('light');
const toastService = new ToastService();

const showToast = (toastType: ToastType, icon?: string) => {
  toastService.showToast(props.message, toastType, icon, props.delay);
};

const changeTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
</script>
