<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-chip
    v-if="!props.lifecycleLabel || props.lifecycleLabel.toLowerCase() === 'unavailable'"
    type="bordered"
    size="small"
  >
    <span class="text-xs font-medium text-neutral-500">Unavailable</span>
  </lfx-chip>
  <lfx-tooltip
    v-else
    placement="top"
    content="Tooltip copy pending"
  >
    <lfx-tag
      :variation="variation"
      type="transparent"
      size="small"
      class="capitalize"
    >
      {{ props.lifecycleLabel }}
    </lfx-tag>
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

// active -> green, stable -> blue, declining -> amber, abandoned -> red, archived -> neutral grey.
const variation = computed<TagStyle>(() => {
  const variations: Record<string, TagStyle> = {
    active: 'positive',
    stable: 'info',
    declining: 'warning',
    abandoned: 'negative',
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
