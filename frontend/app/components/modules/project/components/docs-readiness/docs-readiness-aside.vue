<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="lastEvaluated || nextEvaluation"
      class="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3"
    >
      <div v-if="lastEvaluated">
        <p class="text-xs text-neutral-500">Last evaluated</p>
        <p class="text-base font-semibold">{{ lastEvaluated }}</p>
      </div>
      <div v-if="nextEvaluation">
        <p class="text-xs text-neutral-500">Next evaluation</p>
        <p class="text-base font-semibold">{{ nextEvaluation }}</p>
      </div>
    </div>

    <div
      v-if="showHistory"
      :class="lastEvaluated || nextEvaluation ? 'border-t border-neutral-200 pt-4' : ''"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 class="text-base font-secondary font-semibold">Score history</h3>
        <span class="text-xs text-neutral-500">Latest successful run each month</span>
      </div>
      <div
        role="img"
        :aria-label="historyAria"
        data-testid="history-chart"
        class="flex items-end gap-1 lg:gap-2 h-[170px] mt-3.5 px-1"
      >
        <div
          v-for="bar in bars"
          :key="bar.month"
          data-testid="history-bar"
          class="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-1.5"
        >
          <span
            class="text-xs font-bold"
            :class="bar.failed ? 'text-negative-600' : 'text-neutral-900'"
          >
            {{ bar.failed ? 'Failed' : bar.score }}
          </span>
          <div
            v-if="bar.failed"
            data-testid="history-failed-slot"
            class="w-full max-w-10 h-6 shrink-0 rounded-t-sm border border-dashed border-negative-600"
          />
          <div
            v-else
            data-testid="history-fill"
            class="w-full max-w-10 shrink-0 rounded-t-sm bg-brand-300"
            :style="{ height: `${Math.round((bar.score ?? 0) * 1.1)}px` }"
          />
          <span class="text-xs text-neutral-500">{{ formatMonth(bar.month) }}</span>
          <lfx-tooltip
            v-if="bar.urlChanged"
            :content="`Documentation URL changed to ${displayUrl(bar.docsUrl)}`"
          >
            <span
              data-testid="history-url-changed"
              class="block h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900"
            />
          </lfx-tooltip>
          <span
            v-else
            class="block h-1.5 w-1.5 shrink-0"
          />
        </div>
      </div>
      <p
        v-if="history?.firstEvaluatedMonth"
        class="text-xs text-neutral-500 mt-2.5"
      >
        First evaluated {{ formatMonth(history.firstEvaluatedMonth, 'MMM yyyy') }}.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  displayUrl,
  formatMonth,
  lastEvaluatedLabel,
  nextEvaluationLabel,
} from '~/components/modules/project/services/docs-readiness.service';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { DocsReadinessHistory, DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  summary: DocsReadinessSummary;
  history: DocsReadinessHistory | null;
}>();

const lastEvaluated = computed(() => lastEvaluatedLabel(props.summary));
const nextEvaluation = computed(() => nextEvaluationLabel(props.summary));

const bars = computed(() => (props.history?.months ?? []).filter((month) => month.failed || month.score !== null));

const showHistory = computed(() => ['scored', 'latest-failed'].includes(props.summary.state) && bars.value.length > 0);

const historyAria = computed(
  () =>
    `Score history: ${bars.value
      .map(
        (bar) =>
          `${formatMonth(bar.month)} ${bar.failed ? 'Failed' : bar.score}${bar.urlChanged ? ', docs URL changed' : ''}`,
      )
      .join(', ')}`,
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessAside',
};
</script>
