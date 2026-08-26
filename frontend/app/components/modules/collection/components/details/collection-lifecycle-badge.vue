<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tooltip placement="top">
    <lfx-chip
      v-if="!props.lifecycleLabel"
      type="bordered"
      size="small"
    >
      <span class="text-xs font-medium text-neutral-500">Unavailable</span>
    </lfx-chip>
    <lfx-chip
      v-else
      type="bordered"
      size="small"
      class="flex items-center gap-1"
    >
      <span
        class="size-1.5 rounded-full shrink-0"
        :class="lifecycleDotClass"
      />
      <span class="text-xs font-medium text-neutral-900 capitalize">{{ props.lifecycleLabel }}</span>
    </lfx-chip>

    <template #content>
      <div class="space-y-0.5 text-xs">
        <div><span class="font-semibold">Active</span> — Actively maintained</div>
        <div><span class="font-semibold">Stable</span> — Mature, stable</div>
        <div><span class="font-semibold">Declining</span> — Decreasing activity</div>
        <div><span class="font-semibold">Inert</span> — Inactive, needs attention</div>
        <div><span class="font-semibold">Abandoned</span> — No longer maintained</div>
        <div><span class="font-semibold">Archived</span> — Archived</div>
      </div>
    </template>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const props = defineProps<{
  lifecycleLabel?: string | null;
}>();

// active -> green, stable -> blue, declining -> amber, inert -> darker amber, abandoned -> red, archived -> neutral grey.
const lifecycleDotClass = computed(() => {
  const classes: Record<string, string> = {
    active: 'bg-positive-500',
    stable: 'bg-brand-500',
    declining: 'bg-warning-500',
    inert: 'bg-warning-600',
    abandoned: 'bg-negative-500',
    archived: 'bg-neutral-400',
  };
  return classes[props.lifecycleLabel?.toLowerCase() ?? ''] ?? 'bg-neutral-400';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionLifecycleBadge',
};
</script>
