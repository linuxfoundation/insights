<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Merge lead time
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Average time taken for pull requests to be raised, reviewed, accepted and merged during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
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
          <div class="flex flex-col gap-10 pt-6">
            <lfx-merge-lead-item
              title="Pickup"
              description="Pull request raised"
              icon="code-pull-request"
              :item-value="pickup"
            />
            <lfx-merge-lead-item
              title="Review"
              description="Review started"
              icon="eye"
              :item-value="review"
            />
            <lfx-merge-lead-item
              title="Accepted"
              description="Pull request accepted"
              icon="check-circle"
              :item-value="accepted"
            />
            <lfx-merge-lead-item
              title="Merged"
              description=""
              icon="thumbs-up"
              :item-value="prMerged"
              is-last
            />
          </div>
        </div>
      </lfx-project-load-state>

    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, watch, onServerPrefetch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import LfxMergeLeadItem from './fragments/merge-lead-item.vue';
import type { MergeLeadTime, MergeLeadTimeItem } from '~~/types/development/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import type { Summary } from '~~/types/shared/summary.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';
import {dateOptKeys} from "~/components/modules/project/config/date-options";
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import { FormatterUnits } from '~/components/shared/types/formatter.types';
import {TanstackKey} from "~/components/shared/types/tanstack";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark): void;
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

emit('update:benchmarkValue', {
    key: BenchmarkKeys.MergeLeadTime,
    value: currentInDays.value
  });

watch(mergeLeadTime, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.MergeLeadTime,
    value: currentInDays.value
  });
});

// TODO: Await response from Joana regarding this
const formatDuration = (seconds: number): { value: number, unit: string } => {
  const formattedValue = formatSecondsToDuration(seconds, 'long', undefined, 2);

  return {
    value: Number(formattedValue.replace(/[^0-9.]/g, '')),
    unit: formattedValue.replace(/[^a-zA-Z]/g, '')
  };
};

</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
