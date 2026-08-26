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
      type="solid"
      size="small"
      class="capitalize"
      :class="colorClasses"
    >
      {{ props.lifecycleLabel }}
    </lfx-tag>

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
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { TagStyle } from '~/components/uikit/tag/types/tag.types';

const props = defineProps<{
  lifecycleLabel?: string | null;
}>();

// active -> green, stable -> blue, declining -> amber, inert -> darker amber, abandoned -> red, archived -> neutral grey.
const variation = computed<TagStyle>(() => {
  const variations: Record<string, TagStyle> = {
    active: 'positive',
    stable: 'info',
    declining: 'warning',
    inert: 'warning',
    abandoned: 'negative',
    archived: 'default',
  };
  return variations[props.lifecycleLabel?.toLowerCase() ?? ''] ?? 'default';
});

// Figma-exact bg/text pairs — lfx-tag's generic variation colors don't match this design's tokens,
// so override them directly (!important guards against Tailwind utility ordering).
// inert uses warning-200/warning-600 (from app/assets/styles/variables/_colors.scss) to stay in the
// same amber family as declining while remaining visually distinct — no Figma-exact token exists yet.
const colorClasses = computed(() => {
  const classes: Record<string, string> = {
    active: '!bg-[#d0fae5] !text-[#009966]',
    stable: '!bg-[#ecf4ff] !text-[#009aff]',
    declining: '!bg-[#fef3c6] !text-[#e17100]',
    inert: '!bg-[#fde68a] !text-[#d97706]',
    abandoned: '!bg-[#ffe2e2] !text-[#e7000b]',
    archived: '!bg-[#f1f5f9] !text-[#45556c]',
  };
  return classes[props.lifecycleLabel?.toLowerCase() ?? ''] ?? classes.archived;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionLifecycleBadge',
};
</script>
