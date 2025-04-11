<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Review time by pull request size
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Average time taken to review pull requests, sorted by number of code line changes during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
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
                  :label="`${item.averageReviewTime} ${item.averageReviewTimeUnit}`"
                  hide-empty
                />
              </div>
            </div>
          </div>
        </div>
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import type { ReviewTimeByPrItem } from '~~/types/development/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { links } from '~/config/links';

const route = useRoute();
const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore());

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/development/review-time-by-pr-size`,
  {
    params: {
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);
const reviewTimeByPr = computed<ReviewTimeByPrItem[]>(() => data.value as ReviewTimeByPrItem[]);
const maxValue = computed(() => Math.max(...reviewTimeByPr.value.map((item) => item.averageReviewTime)));
const isEmpty = computed(() => isEmptyData(reviewTimeByPr.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksReviewTimeByPullRequestSize',
}
</script>
