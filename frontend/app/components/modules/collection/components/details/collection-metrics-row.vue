<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="!p-0 !border-none !shadow-none !bg-transparent">
    <div class="flex items-center gap-2 flex-wrap">
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
          class="flex items-center gap-1.5"
        >
          <lfx-icon
            name="layer-group"
            :size="14"
            class="text-neutral-500"
          />
          <span class="text-xs text-neutral-500">Projects:</span>
          <span class="text-xs font-semibold text-neutral-900">
            {{ projectCount !== undefined ? formatNumber(projectCount) : '—' }}
          </span>
        </lfx-chip>

        <lfx-chip
          type="bordered"
          class="flex items-center gap-1.5"
        >
          <lfx-icon
            name="people-group"
            :size="14"
            class="text-neutral-500"
          />
          <span class="text-xs text-neutral-500">Contributors:</span>
          <span class="text-xs font-semibold text-neutral-900">
            {{ contributorCount !== undefined ? formatNumberShort(contributorCount) : '—' }}
          </span>
        </lfx-chip>

        <lfx-chip
          type="bordered"
          class="flex items-center gap-1.5"
        >
          <lfx-icon
            name="heart"
            :size="14"
            class="text-neutral-500"
          />
          <span class="text-xs text-neutral-500">Avg. Health:</span>
          <lfx-health-score
            v-if="avgHealthScore !== undefined"
            :score="avgHealthScore"
          />
          <span
            v-else
            class="text-xs font-semibold text-neutral-900"
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
import LfxHealthScore from '~/components/shared/components/health-score.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';

const props = defineProps<{
  metrics?: CollectionMetrics;
  loading?: boolean;
}>();

const projectCount = computed(() => props.metrics?.projectCount);
const contributorCount = computed(() => props.metrics?.uniqueContributorCount);
const avgHealthScore = computed(() => props.metrics?.avgHealthScore);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionMetricsRow',
};
</script>
