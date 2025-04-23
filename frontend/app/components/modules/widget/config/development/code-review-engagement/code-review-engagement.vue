<template>
  <section class="mt-5">
    <lfx-tabs
      :tabs="tabs"
      :model-value="activeTab"
      @update:model-value="activeTab = $event as CodeReviewEngagementMetric"
    />
    <div class="mt-7 mb-8">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div class="flex flex-row gap-4 items-center">
          <div class="text-data-display-1">{{ formatNumber(summary.current) }} contributors</div>
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
          :metric="activeTab"
          :code-review-item="codeReviewEngagement.data"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, computed, onServerPrefetch } from 'vue';
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

const {
 startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore());

const activeTab = ref(CodeReviewEngagementMetric.PR_PARTICIPANTS);
const route = useRoute();

const queryKey = computed(() => [
  TanstackKey.CODE_REVIEW_ENGAGEMENT,
  route.params.slug,
  activeTab.value,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<CodeReviewEngagement> = async () => $fetch(
    `/api/project/${route.params.slug}/development/code-review-engagement`,
    {
  params: {
    metric: activeTab.value,
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
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCodeReviewEngagement',
}
</script>
