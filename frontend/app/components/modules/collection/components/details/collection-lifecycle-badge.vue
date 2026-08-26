<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    placement="top"
    trigger-event="hover"
  >
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
      <div class="w-64 space-y-1.5 text-xs bg-white border border-neutral-100 rounded-xl shadow-xl p-3">
        <div class="flex items-center gap-1.5">
          <span
            class="size-2 rounded-full shrink-0"
            :class="dotClass"
          />
          <span class="font-semibold text-neutral-900 capitalize">{{ props.lifecycleLabel ?? 'Unavailable' }}</span>
        </div>
        <p class="text-neutral-500">{{ lifecycleDescription }}</p>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import type { TagStyle } from '~/components/uikit/tag/types/tag.types';
import { getLifecycleDescription } from '~~/config/health-breakdown-templates';

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

const dotClass = computed(() => {
  const classes: Record<string, string> = {
    active: 'bg-[#009966]',
    stable: 'bg-[#009aff]',
    declining: 'bg-[#e17100]',
    inert: 'bg-[#d97706]',
    abandoned: 'bg-[#e7000b]',
    archived: 'bg-[#45556c]',
  };
  return classes[props.lifecycleLabel?.toLowerCase() ?? ''] ?? classes.archived;
});

const lifecycleDescription = computed(() => getLifecycleDescription(props.lifecycleLabel?.toLowerCase() ?? null, null));
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionLifecycleBadge',
};
</script>
