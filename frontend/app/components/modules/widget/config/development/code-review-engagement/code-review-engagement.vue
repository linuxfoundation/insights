<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <template v-if="!props.snapshot">
      <lfx-tabs
        v-if="!props.snapshot"
        :tabs="tabs"
        :model-value="model.activeTab"
        class="!hidden sm:!flex"
        @update:model-value="model.activeTab = $event as CodeReviewEngagementMetric"
      />
      <lfx-dropdown-select
        v-model="model.activeTab"
        placement="bottom-start"
        class="block sm:hidden"
      >
        <template  #trigger="{selectedOption}">
          <lfx-dropdown-selector type="filled">
            {{selectedOption.label}}
          </lfx-dropdown-selector>
        </template>
        <lfx-dropdown-item
          v-for="tab of tabs"
          :key="tab.label"
          :value="tab.value"
          :label="tab.label"
        />
      </lfx-dropdown-select>
    </template>
    <div class="my-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div class="flex flex-wrap gap-y-3 flex-row gap-4 items-center">
          <div class="text-heading-1 sm:text-data-display-1">{{ formatNumber(summary.current) }} contributors</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
          />
        </div>
      </lfx-skeleton-state>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching code review engagement"
      :is-empty="isEmpty"
      use-min-height
      :height="330"
    >
      <div class="w-full min-h-[330px]">
        <div class="font-semibold mb-5">
          <span class="text-black">Top contributors </span>
        </div>

        <lfx-code-review-table
          show-percentage
          :metric="model.activeTab"
          :code-review-item="codeReviewEngagement.data"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { CodeReviewEngagement } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import {CodeReviewEngagementMetric} from "~~/types/development/requests.types";
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxCodeReviewTable from "~/components/modules/widget/components/development/fragments/code-review-table.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import type {Benchmark} from "~~/types/shared/benchmark.types";
import {Widget} from "~/components/modules/widget/types/widget";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";

interface CodeReviewEngagementModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: CodeReviewEngagementModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: CodeReviewEngagementModel): void;
  (e: 'update:benchmarkValue', value: Benchmark | undefined): void;
  (e: 'dataLoaded', value: string): void;
}>();

const model = computed<CodeReviewEngagementModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
 startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore());

const route = useRoute();

const queryKey = computed(() => [
  TanstackKey.CODE_REVIEW_ENGAGEMENT,
  route.params.slug,
  model.value.activeTab,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<CodeReviewEngagement> = async () => $fetch(
    `/api/project/${route.params.slug}/development/code-review-engagement`,
    {
  params: {
    metric: model.value.activeTab,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data, status, error, suspense
} = useQuery<CodeReviewEngagement>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense();
});

const codeReviewEngagement = computed<CodeReviewEngagement>(() => data.value as CodeReviewEngagement);

const summary = computed<Summary>(() => codeReviewEngagement.value.summary);

const tabs = [
  { label: 'PR participants', value: CodeReviewEngagementMetric.PR_PARTICIPANTS },
  { label: 'Review comments', value: CodeReviewEngagementMetric.REVIEW_COMMENTS },
  { label: 'Code reviews', value: CodeReviewEngagementMetric.CODE_REVIEWS }
];

const isEmpty = computed(() => isEmptyData(
  (codeReviewEngagement.value?.data || []) as unknown as Record<string, unknown>[]
));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.CODE_REVIEW_ENGAGEMENT);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCodeReviewEngagement',
}
</script>
