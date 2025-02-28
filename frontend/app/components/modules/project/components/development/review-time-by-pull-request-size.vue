<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Review time by pull request size
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="w-full min-h-[380px] my-5">
        <div v-if="status === 'success'" class="flex flex-col gap-8 text-neutral-900 text-sm">
          <div v-for="item in reviewTimeByPr" :key="item.sortId" class="flex flex-col gap-2">
            <div class="flex flex-row gap-2">
              <span>{{ item.lines }} lines</span>
              <span class="text-neutral-400">{{ item.prCount }} pull requests</span>
            </div>
            <div class="pr-4">
              <lfx-progress-bar
                :values="[item.averageReviewTime / maxValue * 100]"
                :label="`${item.averageReviewTime} ${item.averageReviewTimeUnit}`" hide-empty />
            </div>
          </div>
        </div>
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { computed, watch } from 'vue';
import type { ReviewTimeByPrItem } from './types/review-time-by-pr.types';
import LfxCard from '~/components/uikit/card/card.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);

const { showToast } = useToastService();

const route = useRoute();

const { data, status, error } = useFetch(
  () => '/api/projects/development/review-time-by-pr-size',
  {
    params: {
      project: route.params.slug,
      repository: route.params.name || '',
      'time-period': props.timePeriod
    }
  }
);
const reviewTimeByPr = computed<ReviewTimeByPrItem[]>(() => data.value as ReviewTimeByPrItem[]);
const maxValue = computed(() => Math.max(...reviewTimeByPr.value.map((item) => item.averageReviewTime)));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching social mentions: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});

</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksReviewTimeByPullRequestSize',
}
</script>
