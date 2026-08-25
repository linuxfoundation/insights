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
    <lfx-tag
      v-else
      :variation="variation"
      type="transparent"
      size="small"
      class="capitalize"
    >
      {{ props.lifecycleLabel }}
    </lfx-tag>

    <template #content>
      <div class="space-y-0.5 text-xs">
        <div><span class="font-semibold">Active</span> — Actively maintained</div>
        <div><span class="font-semibold">Stable</span> — Mature, stable</div>
        <div><span class="font-semibold">Declining</span> — Decreasing activity</div>
        <div><span class="font-semibold">Abandoned</span> — No longer maintained</div>
        <div><span class="font-semibold">Archived</span> — Archived</div>
      </div>
    </template>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { TagStyle } from '~/components/uikit/tag/types/tag.types';

const props = defineProps<{
  lifecycleLabel?: string | null;
}>();

const variation = computed<TagStyle>(() => {
  const variations: Record<string, TagStyle> = {
    active: 'positive',
    stable: 'info',
    declining: 'warning',
    abandoned: 'negative',
    inert: 'warning',
    archived: 'default',
  };
  return variations[props.lifecycleLabel?.toLowerCase() ?? ''] ?? 'default';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionLifecycleBadge',
};
</script>
