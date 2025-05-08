<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching review time by pull request size"
      :is-empty="isEmpty"
      use-min-height
      :height="380"
    >
      <div class="w-full min-h-[380px] my-5">
        <div class="flex flex-col gap-5 text-neutral-900 text-sm">
          <div
            v-for="item in reviewTimeByPr"
            :key="item.sortId"
            class="flex flex-col gap-2"
          >
            <div class="flex flex-row gap-2">
              <span>{{ item.lines }} lines</span>
              <span class="text-neutral-400">{{ item.prCount }} pull requests</span>
            </div>
            <div class="pr-4">
              <lfx-progress-bar
                :values="[item.averageReviewTime / maxValue * 100]"
                :label="convertAverageReviewTime(item.averageReviewTime)"
                hide-empty
              />
            </div>
          </div>
        </div>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { ReviewTimeByPrItem } from '~~/types/development/responses.types';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const route = useRoute();
const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore());

const queryKey = computed(() => [
  TanstackKey.REVIEW_TIME_BY_PULL_REQUEST_SIZE,
  route.params.slug,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<ReviewTimeByPrItem[]> = async () => $fetch(
    `/api/project/${route.params.slug}/development/review-time-by-pr-size`,
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
} = useQuery<ReviewTimeByPrItem[]>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense();
});
const reviewTimeByPr = computed<ReviewTimeByPrItem[]>(() => data.value as ReviewTimeByPrItem[]);
const maxValue = computed(() => Math.max(...reviewTimeByPr.value.map((item) => item.averageReviewTime)));
const isEmpty = computed(() => isEmptyData(reviewTimeByPr.value as unknown as Record<string, unknown>[]));

const convertAverageReviewTime = (value: number) => formatSecondsToDuration(value, 'long');
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksReviewTimeByPullRequestSize',
}
</script>
