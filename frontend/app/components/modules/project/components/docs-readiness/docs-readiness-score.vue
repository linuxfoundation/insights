<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-wrap items-center gap-x-6 gap-y-4">
    <div
      role="img"
      :aria-label="`Score ${summary.score} out of 100`"
      class="shrink-0"
    >
      <lfx-health-score-ring
        :score="summary.score ?? 0"
        :color="scoreColor()"
        large
      />
    </div>
    <div class="flex flex-col gap-2 min-w-0 flex-1 basis-56">
      <p
        v-if="median"
        class="text-sm text-neutral-600"
      >
        {{ median }}
      </p>
      <p
        v-if="checks?.categories.length"
        class="flex flex-wrap gap-x-3.5 gap-y-1 text-sm"
      >
        <span class="text-positive-600"
          ><b>{{ checks.counts.passed }}</b> passed</span
        >
        <span class="text-warning-700">
          <b>{{ checks.counts.needsAttention }}</b>
          {{ checks.counts.needsAttention === 1 ? 'needs attention' : 'need attention' }}
        </span>
        <span class="text-negative-600"
          ><b>{{ checks.counts.failed }}</b> failed</span
        >
        <span class="text-neutral-500"
          ><b>{{ checks.counts.skipped }}</b> skipped</span
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LfxHealthScoreRing from '~/components/modules/project/components/overview/trust-score/health-score-ring.vue';
import { medianLine, scoreColor } from '~/components/modules/project/services/docs-readiness.service';
import type { DocsReadinessChecks, DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  summary: DocsReadinessSummary;
  checks: DocsReadinessChecks | null;
}>();

const median = computed(() => medianLine(props.summary.median));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessScore',
};
</script>
