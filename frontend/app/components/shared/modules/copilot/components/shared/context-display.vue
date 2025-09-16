<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <span
    v-if="!allowAllWidgets"
    class="flex gap-1 items-center rounded-full text-nowrap"
    :class="displayClass"
  >
    <lfx-icon
      :name="widgetIcon"
      :size="12"
      :type="type === 'transparent' ? 'light' : 'solid'"
    />
    {{ widgetDisplayName }}
  </span>
  <lfx-popover
    v-else
    v-model:visibility="isOpen"
    placement="top-start"
  >
    <span
      class="flex gap-1 items-center rounded-full text-nowrap cursor-pointer"
      :class="displayClass"
    >
      <lfx-icon
        :name="widgetIcon"
        :size="12"
        :type="type === 'transparent' ? 'light' : 'solid'"
      />
      {{ widgetDisplayName }}
    </span>

    <template #content>

      <div class="bg-white shadow-lg rounded-lg border border-neutral-200 max-h-[80vh] overflow-y-auto">
        <div 
          v-for="widgetKey in widgetWithCopilot" 
          :key="widgetKey"
          class="flex gap-2 items-center cursor-pointer bg-white hover:bg-neutral-50 transition px-4 py-3"
          @click="handleWidgetClick(widgetKey)"
        >
          {{ lfxWidgets[widgetKey as Widget].name }}
        </div>
      </div>
    </template>
  </lfx-popover>
  
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config'
import type { Widget } from '~/components/modules/widget/types/widget';
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxPopover from '~/components/uikit/popover/popover.vue'

const emit = defineEmits<{
  (e: 'valueSelected', widgetKey: Widget): void
}>();
const props = defineProps<{
  widgetName: Widget | undefined;
  type: 'transparent' | 'solid';
  allowAllWidgets: boolean;
}>()

const widget = computed(() => lfxWidgets[(props.widgetName || '') as Widget]);
const widgetDisplayName = computed(() => widget.value?.name || 'Point metric');
const widgetIcon = computed(() => widget.value?.copilot?.icon || 'bullseye-pointer');
const isOpen = ref(false);

const widgetWithCopilot = computed(() => {
  return Object.keys(lfxWidgets).filter((widgetKey) => lfxWidgets[widgetKey as Widget].copilot);
});

const displayClass = computed(() => {
  const transparent = `text-sm text-neutral-900 bg-transparent px-2.5 py-1 border border-solid border-neutral-200`;
  const solid = `text-xs text-brand-500 font-semibold bg-brand-50 px-1.5 py-0.5`;
  const dashed = `text-sm text-neutral-500 bg-transparent px-2.5 py-1 border border-dashed border-neutral-400`;

  // TODO: need clarification on this part, for now setting default to dashed if there is no widget passed
  if (!props.widgetName) {
    return dashed;
  }

  return props.type === 'transparent' ? transparent : solid;
});

const handleWidgetClick = (widgetKey: Widget) => {
  emit('valueSelected', widgetKey);
  isOpen.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxContextDisplay'
}
</script>