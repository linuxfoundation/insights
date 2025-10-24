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
      :height="330"
    >
      <div class="w-full">
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
                :values="[(item.averageReviewTime / maxValue) * 100]"
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
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { ReviewTimeByPrItem } from '~~/types/development/responses.types';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { Widget } from '~/components/modules/widget/types/widget';
import {
  DEVELOPMENT_API_SERVICE,
  type QueryParams,
} from '~/components/modules/widget/services/development.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

const props = defineProps<{
  modelValue?: WidgetModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: WidgetModel): void;
}>();

const model = computed<WidgetModel>({
  get: () => props.modelValue || {},
  set: (value: WidgetModel) => emit('update:modelValue', value),
});

const route = useRoute();
const { startDate, endDate, selectedReposValues } = storeToRefs(useProjectStore());

const params = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: '', // Not needed for review time by PR size
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchReviewTimeByPrSize(params);

const reviewTimeByPr = computed<ReviewTimeByPrItem[]>(() => data.value as ReviewTimeByPrItem[]);
const maxValue = computed(() =>
  Math.max(...reviewTimeByPr.value.map((item: ReviewTimeByPrItem) => item.averageReviewTime)),
);
const isEmpty = computed(() => isEmptyData(reviewTimeByPr.value as unknown as Record<string, unknown>[]));

const convertAverageReviewTime = (value: number) => formatSecondsToDuration(value, 'long');

watch(
  status,
  (value: string) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.REVIEW_TIME_BY_PULL_REQUEST_SIZE);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => model.value,
  (value: WidgetModel) => {
    emit('update:modelValue', value);
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksReviewTimeByPullRequestSize',
};
</script>
