<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="relative">
    <lfx-popover
      v-model:visibility="isOpen"
      placement="bottom-end"
    >
      <lfx-widget-menu-item
        class="flex gap-2 items-center cursor-pointer"
        :class="`${link.showLabel ? '!w-auto !px-4' : ''} ${link.buttonClass}`"
      >
        <lfx-icon
          :name="link.icon"
          :size="18"
          :class="link.iconClass"
        />
        <span
          v-if="link.showLabel"
          class="text-sm font-medium"
        >{{link.label}}</span>
      </lfx-widget-menu-item>

      <template #content>
        <component
          :is="link.popOverComponent"
          :widget-name="widgetName"
        />
      </template>
    </lfx-popover>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";
import type { MenuItem } from "./widget-menu.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";

const emit = defineEmits<{
  (e: 'update:isPopoverMenuClicked', value: boolean): void
}>();
const isOpen = ref(false);
defineProps<{
  link: MenuItem,
  widgetName: string
}>();

// Watch for changes to isOpen and emit the event
watch(isOpen, (newValue) => {
  emit('update:isPopoverMenuClicked', newValue);
});
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenuPopover',
};
</script>
