<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <span
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
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config'
import type { Widget } from '~/components/modules/widget/types/widget';
import LfxIcon from '~/components/uikit/icon/icon.vue'

const props = defineProps<{
  widgetName: string;
  type: 'transparent' | 'solid';
}>()

const widget = computed(() => lfxWidgets[props.widgetName as Widget]);
const widgetDisplayName = computed(() => widget.value?.name || 'Point metric');
const widgetIcon = computed(() => widget.value?.copilot?.icon || 'bullseye-pointer');

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
</script>

<script lang="ts">
export default {
  name: 'LfxContextDisplay'
}
</script>