<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="!p-0 !border-none !shadow-none !bg-transparent">
    <div class="flex items-center gap-3 flex-wrap">
      <template v-if="loading">
        <lfx-skeleton
          v-for="i in 3"
          :key="i"
          height="2rem"
          width="9rem"
          class="rounded-full"
        />
      </template>
      <template v-else>
        <lfx-chip
          type="bordered"
          size="small"
          class="flex items-center gap-1"
        >
          <lfx-icon
            name="layer-group"
            :size="14"
            class="text-[#45556c]"
          />
          <span class="text-xs text-neutral-500">Projects / Repositories:</span>
          <span class="text-xs font-medium text-neutral-900">
            {{ projectAndRepositoryCount !== undefined ? formatNumber(projectAndRepositoryCount) : '—' }}
          </span>
        </lfx-chip>

        <lfx-chip
          type="bordered"
          size="small"
          class="flex items-center gap-1"
        >
          <lfx-icon
            name="people-group"
            :size="14"
            class="text-[#45556c]"
          />
          <span class="text-xs text-neutral-500">Contributors:</span>
          <span class="text-xs font-medium text-neutral-900">
            {{ contributorCount !== undefined ? formatNumberShort(contributorCount) : '—' }}
          </span>
        </lfx-chip>

        <lfx-chip
          type="bordered"
          size="small"
          class="flex items-center gap-1"
        >
          <lfx-icon
            name="heart"
            :size="14"
            class="text-[#45556c]"
          />
          <span class="text-xs text-neutral-500">Avg. Health:</span>
          <template v-if="avgHealthScore !== undefined && avgHealthScore !== null">
            <span
              class="size-1.5 rounded-full shrink-0"
              :class="healthScoreDotClass"
            />
            <span class="text-xs font-medium text-neutral-900"> {{ healthScoreLabel }} ({{ avgHealthScore }}) </span>
          </template>
          <span
            v-else
            class="text-xs font-medium text-neutral-900"
          >
            —
          </span>
        </lfx-chip>
      </template>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CollectionMetrics } from '~~/types/collection';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';

const props = defineProps<{
  metrics?: CollectionMetrics;
  loading?: boolean;
}>();

const projectAndRepositoryCount = computed(() => props.metrics?.projectAndRepositoryCount);
const contributorCount = computed(() => props.metrics?.uniqueContributorCount);
const avgHealthScore = computed(() => props.metrics?.avgHealthScore);

// Labels/colors are a deliberate, scoped divergence from health-score.vue's palette for the
// Collections v2 metrics-row dot only — matched to Figma's exact hexes (see IN-1191 design
// fidelity report). health-score.vue itself is intentionally left untouched.
const healthScoreLabel = computed(() => {
  const score = avgHealthScore.value ?? 0;
  if (score > 80) return 'Excellent';
  if (score > 60) return 'Healthy';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Concerning';
  return 'Critical';
});

const healthScoreDotClass = computed(() => {
  const score = avgHealthScore.value ?? 0;
  if (score > 60) return 'bg-[#00bc7d]';
  if (score >= 20) return 'bg-[#fe9a00]';
  return 'bg-[#fb2c36]';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionMetricsRow',
};
</script>
