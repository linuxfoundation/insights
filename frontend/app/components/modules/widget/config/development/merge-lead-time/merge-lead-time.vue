<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="text-neutral-400 text-xs mb-1">
      Average time to merge
    </div>
    <lfx-skeleton-state
      :status="status"
      height="2rem"
      width="7.5rem"
    >
      <div class="flex flex-row gap-4 items-center">
        <div class="text-data-display-1">{{ current }}</div>
        <lfx-delta-display
          v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
          :summary="summary"
          unit="d"
          is-duration
          is-reverse
        />
      </div>
    </lfx-skeleton-state>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching merge lead time"
      :is-empty="isEmpty"
      use-min-height
      :height="250"
    >
      <div class="w-full min-h-[250px] mt-5">
        <div class="flex flex-col gap-10">
          <lfx-merge-lead-item
            title="Pickup"
            description="Pull Request assigned"
            icon="user-check"
            :item-value="pickup"
          />
          <lfx-merge-lead-item
            title="Review"
            description="Review Started"
            icon="eye"
            :item-value="review"
          />
          <lfx-merge-lead-item
            title="Accepted"
            description="Pull Request approved"
            icon="check-circle"
            :item-value="accepted"
          />
          <lfx-merge-lead-item
            title="Pull Request merged"
            description=""
            icon="code-merge"
            :item-value="prMerged"
            is-last
          />
        </div>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, watch, onServerPrefetch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import LfxMergeLeadItem from "./fragments/merge-lead-item.vue";
import type { MergeLeadTime, MergeLeadTimeItem } from '~~/types/development/responses.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import type { Summary } from '~~/types/shared/summary.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import {dateOptKeys} from "~/components/modules/project/config/date-options";
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import { FormatterUnits } from '~/components/shared/types/formatter.types';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark | undefined): void;
(e: 'dataLoaded', value: string): void;
}>();

const {
 startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore())

const route = useRoute();

const queryKey = computed(() => [
  TanstackKey.MERGE_LEAD_TIME,
  route.params.slug,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<MergeLeadTime> = async () => $fetch(
    `/api/project/${route.params.slug}/development/merge-lead-time`,
    {
  params: {
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data, status, error, suspense
} = useQuery<MergeLeadTime>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
});

const mergeLeadTime = computed<MergeLeadTime>(() => data.value as MergeLeadTime);
const pickup = computed<MergeLeadTimeItem>(() => ({
  ...mergeLeadTime.value.data.pickup,
  ...formatDuration(mergeLeadTime.value.data.pickup.value)
} as MergeLeadTimeItem));
const review = computed<MergeLeadTimeItem>(() => ({
  ...mergeLeadTime.value.data.review,
  ...formatDuration(mergeLeadTime.value.data.review.value)
} as MergeLeadTimeItem));
const accepted = computed<MergeLeadTimeItem>(() => ({
  ...mergeLeadTime.value.data.accepted,
  ...formatDuration(mergeLeadTime.value.data.accepted.value)
} as MergeLeadTimeItem));
const prMerged = computed<MergeLeadTimeItem>(() => ({
  ...mergeLeadTime.value.data.prMerged,
  ...formatDuration(mergeLeadTime.value.data.prMerged.value)
} as MergeLeadTimeItem));

const summary = computed<Summary>(() => mergeLeadTime.value?.summary);
const current = computed<string>(() => formatSecondsToDuration(mergeLeadTime.value?.summary?.current || 0, 'long'));
const currentInDays = computed<number>(() => {
  const current = mergeLeadTime.value?.summary?.current || 0;
  return Number(formatSecondsToDuration(current, 'no', FormatterUnits.DAYS));
});

const isEmpty = computed(() => isEmptyData((mergeLeadTime.value?.data || []) as unknown as Record<string, unknown>[]));

const callEmit = () => {
  emit('update:benchmarkValue', status.value === 'success' ? {
    key: BenchmarkKeys.MergeLeadTime,
    value: currentInDays.value
  } : undefined);
}

callEmit();

watch(mergeLeadTime, callEmit);

// TODO: Await response from Joana regarding this
const formatDuration = (seconds: number): { value: number, unit: string } => {
  const formattedValue = formatSecondsToDuration(seconds, 'long', undefined, 2);

  return {
    value: Number(formattedValue.replace(/[^0-9.]/g, '')),
    unit: formattedValue.replace(/[^a-zA-Z]/g, '')
  };
};

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.MERGE_LEAD_TIME);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
