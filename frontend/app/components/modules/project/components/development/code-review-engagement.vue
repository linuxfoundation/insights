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
      <div
        v-if="status === 'success'"
        class="flex flex-row gap-4 items-center mt-7 mb-8"
      >
        <div class="text-data-display-1">{{ formatNumber(summary.current) }} contributors</div>
        <lfx-delta-display
          :summary="summary"
          icon="circle-arrow-up-right"
          icon-type="solid"
        />
      </div>
      <div class="w-full h-[330px]">
        <div v-if="status === 'success'">
          <div class="font-semibold mb-5 mt-8">
            <span class="text-black">Top contributors </span>
          </div>

          <lfx-code-review-table
            show-percentage
            :metric="activeTab"
            :code-review-item="codeReviewEngagement.data"
          />
        </div>
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import type { CodeReviewEngagement } from './types/code-review-engagement.types';
import LfxCodeReviewTable from './fragments/code-review-table.vue';
import type { Summary } from '~/components/shared/types/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";

const { showToast } = useToastService();

const { startDate, endDate } = storeToRefs(useProjectStore());

const activeTab = ref('pr-participants');
const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/development/code-review-engagement`,
  {
    params: {
      metric: activeTab.value,
      repository: route.params.name || '',
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

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching code review engagement: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCodeReviewEngagement',
}
</script>
