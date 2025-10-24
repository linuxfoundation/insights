<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div
      v-if="!isEmpty"
      class="text-neutral-400 text-xs mb-1"
    >
      Average time to merge
    </div>
    <lfx-skeleton-state
      :status="status"
      height="2rem"
      width="7.5rem"
    >
      <div
        v-if="summary && !isEmpty"
        class="flex flex-row gap-4 items-center"
      >
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
import { computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import LfxMergeLeadItem from "./fragments/merge-lead-item.vue";
import type { MergeLeadTime, MergeLeadTimeItem, MergeLeadTimeUnit } from '~~/types/development/responses.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import type { Summary } from '~~/types/shared/summary.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import {dateOptKeys} from "~/components/modules/project/config/date-options";
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import { DEVELOPMENT_API_SERVICE, type QueryParams } 
  from '~/components/modules/widget/services/development.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

const props = defineProps<{
  modelValue?: WidgetModel,
  snapshot?: boolean;
}>()

const emit = defineEmits<{
(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: WidgetModel): void;
(e: 'hasData', value: boolean): void;
}>();

const model = computed<WidgetModel>({
  get: () => props.modelValue || {},
  set: (value: WidgetModel) => emit('update:modelValue', value)
})

const {
 startDate, endDate, selectedReposValues, selectedTimeRangeKey
} = storeToRefs(useProjectStore())

const route = useRoute();

const params = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: '', // Not needed for merge lead time
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const {
  data, status, error
} = DEVELOPMENT_API_SERVICE.fetchMergeLeadTime(params);

const mergeLeadTime = computed<MergeLeadTime>(() => data.value as MergeLeadTime);
const pickup = computed<MergeLeadTimeItem | undefined>(() => getMergeLeadTimeItem(mergeLeadTime.value, 'pickup'));
const review = computed<MergeLeadTimeItem | undefined>(() => getMergeLeadTimeItem(mergeLeadTime.value, 'review'));
const accepted = computed<MergeLeadTimeItem | undefined>(() => getMergeLeadTimeItem(mergeLeadTime.value, 'accepted'));
const prMerged = computed<MergeLeadTimeItem | undefined>(() => getMergeLeadTimeItem(mergeLeadTime.value, 'prMerged'));

const summary = computed<Summary>(() => mergeLeadTime.value?.summary);
const current = computed<string>(() => formatSecondsToDuration(mergeLeadTime.value?.summary?.current || 0, 'long'));

const isEmpty = computed(() => [pickup.value, review.value, accepted.value, prMerged.value].every((item) => 
  item?.value === 0 || item === undefined));

// TODO: Await response from Joana regarding this
const formatDuration = (seconds: number): { 
  value: number, 
  unit: MergeLeadTimeUnit } => {
  const formattedValue = formatSecondsToDuration(seconds, 'long', undefined, 2);

  return {
    value: Number(formattedValue.replace(/[^0-9.]/g, '')),
    unit: formattedValue.replace(/[^a-zA-Z]/g, '') as MergeLeadTimeUnit
  };
};

const getMergeLeadTimeItem = (
  data: MergeLeadTime | undefined,
  key: string
): MergeLeadTimeItem | undefined => {
  if (!data) {
    return undefined;
  }
  const item = data.data[key as keyof MergeLeadTime['data']];

  if (item && item.value >= 0) {
    return {
      ...item,
      ...formatDuration(item.value)
    };
  }

  return undefined;
};

watch(status, (value: string) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.MERGE_LEAD_TIME);
  }
}, {
  immediate: true
});

watch(isEmpty, (value: boolean) => {
  emit('hasData', !value);
}, {
  immediate: true
});

watch(() => model.value, (value: WidgetModel) => {
  emit('update:modelValue', value);
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
