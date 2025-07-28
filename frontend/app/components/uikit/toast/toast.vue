<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-toast
    :theme="props.theme"
    position="bottom-center"
  >
    <template #message="slotProps">
      <div class="flex items-center gap-3">
        <i
          class="p-toast-icon"
          :class="getToastIcon(slotProps.message)"
        />
        <div>
          <p
            v-if="slotProps.message.title"
            class="text-sm font-semibold leading-5"
          >{{ slotProps.message.title }}</p>
          <p class="text-xs leading-5">
            {{slotProps.message.detail }}
          </p>
        </div>
        <div v-if="slotProps.message.actionLabel">
          <a
            v-if="slotProps.message.actionUrl"
            :href="slotProps.message.actionUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <lfx-button
              type="tertiary"
              size="small"
            >
              {{slotProps.message.actionLabel}}
            </lfx-button>
          </a>
          <lfx-button
            v-else-if="slotProps.message.action"
            type="tertiary"
            size="small"
            @click="slotProps.message.action()"
          >
            {{slotProps.message.actionLabel}}
          </lfx-button>

        </div>
      </div>

    </template>
  </pv-toast>
</template>

<script setup lang="ts">
import type { ToastOptions, ToastTheme } from './types/toast.types';
import { ToastTypesEnum } from './types/toast.types';
import LfxButton from "~/components/uikit/button/button.vue";

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
