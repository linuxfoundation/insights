<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tooltip
    v-if="variation"
    placement="top"
    class="inline-flex"
    :disabled="!partialNoteVisible"
    :allow-pass-through="true"
  >
    <lfx-tag :variation="variation">
      {{ tagLabel }}
    </lfx-tag>
    <span
      v-if="partialNoteVisible"
      class="sr-only"
    >
      {{ partialNote }}
    </span>
    <template #content>
      <div class="max-w-xs text-xs leading-relaxed">
        {{ partialNote }}
      </div>
    </template>
  </lfx-tooltip>
  <span v-else>-</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LfxTag from '~/components/uikit/tag/tag.vue';
import type { TagStyle } from '~/components/uikit/tag/types/tag.types';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { getMissingHealthCategoryNameFromMaxScore } from '~~/config/health-breakdown-templates';
import { getHealthScoreV2Config, isPartialHealthScore } from '~~/config/trust-score';

// The band comes from the server-side healthLabel, which already accounts for partial scores.
const props = defineProps<{
  label: string;
  healthMaxScore?: number | null;
}>();

const variations: Record<string, TagStyle> = {
  excellent: 'positive-solid',
  healthy: 'positive',
  fair: 'accent',
  concerning: 'warning',
  critical: 'negative-solid',
};

const band = computed(() => props.label.toLowerCase());
const variation = computed(() => variations[band.value]);

const isPartial = computed(() => isPartialHealthScore(props.healthMaxScore));
const tagLabel = computed(() => getHealthScoreV2Config(band.value, isPartial.value).label);

const missingCategoryName = computed(() => getMissingHealthCategoryNameFromMaxScore(props.healthMaxScore));
const partialNoteVisible = computed(() => isPartial.value && !!missingCategoryName.value);
const partialNote = computed(
  () =>
    `This Health Score is partial because the ${missingCategoryName.value} category is missing data for this project. ` +
    'The score is computed from the remaining categories only.',
);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScore',
};
</script>
