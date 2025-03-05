<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Code review engagement
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <lfx-tabs
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
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
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
            />
          </div>
        </lfx-skeleton-state>
      </div>
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching forks"
        :is-empty="isEmpty"
        use-min-height
        :height="330"
      >
        <div class="w-full h-[330px]">
          <div class="font-semibold mb-5 mt-8">
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
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { CodeReviewEngagement } from './types/code-review-engagement.types';
import LfxCodeReviewTable from './fragments/code-review-table.vue';
import type { Summary } from '~/components/shared/types/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore());

const activeTab = ref('pr-participants');
const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/development/code-review-engagement`,
  {
    params: {
      metric: activeTab.value,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const codeReviewEngagement = computed<CodeReviewEngagement>(() => data.value as CodeReviewEngagement);

const summary = computed<Summary>(() => codeReviewEngagement.value.summary);

const tabs = [
  { label: 'PR participants', value: 'pr-participants' },
  { label: 'Review comments', value: 'review-comments' },
  { label: 'Code reviews', value: 'code-reviews' }
];

const isEmpty = computed(() => isEmptyData(codeReviewEngagement.value.data as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCodeReviewEngagement',
}
</script>
