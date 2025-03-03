<template>
  <pv-toast
    :theme="props.theme"
    position="bottom-center"
  >
    <template #message="slotProps">
      <i
        class="p-toast-icon"
        :class="getToastIcon(slotProps.message)"
      />
      {{ slotProps.message.detail }}
    </template>
  </pv-toast>
</template>

<script setup lang="ts">
import type { ToastOptions, ToastTheme } from './types/toast.types';
import { ToastTypesEnum } from './types/toast.types';

const props = withDefaults(
  defineProps<{
    theme?: ToastTheme;
  }>(),
  {
    theme: 'dark'
  }
);

const getToastIcon = (options: ToastOptions) => {
  if (options.severity === ToastTypesEnum.default && options.icon) {
    return options.icon;
  }

  switch (options.severity as string) {
    case ToastTypesEnum.info:
      return 'fa-solid fa-circle-info';
    case ToastTypesEnum.positive:
      return 'fa-solid fa-circle-check';
    case ToastTypesEnum.warning:
      return 'fa-solid fa-triangle-exclamation';
    case ToastTypesEnum.negative:
      return 'fa-solid fa-circle-exclamation';
    default:
      return 'fa-light fa-compass';
  }
};
</script>
<script lang="ts">
export default {
  name: 'LfxToast'
};
</script>
