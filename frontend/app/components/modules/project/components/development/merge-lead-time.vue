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
          <div class="text-data-display-1">{{ formatNumber(summary.current) }} days</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
            icon="circle-arrow-up-right"
            icon-type="solid"
            unit="d"
          />
        </div>
      </lfx-skeleton-state>

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching forks"
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
import { useFetch, useRoute } from 'nuxt/app';
import { computed } from 'vue';
import { storeToRefs } from "pinia";
import { Duration } from 'luxon';
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import LfxMergeLeadItem from './fragments/merge-lead-item.vue';
import type { MergeLeadTime, MergeLeadTimeItem } from '~~/types/development/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { Summary } from '~~/types/shared/summary.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';
import {dateOptKeys} from "~/components/modules/project/config/date-options";

const {
 startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore())

const route = useRoute();

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/development/merge-lead-time`,
  {
    params: {
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

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

const summary = computed<Summary>(() => mergeLeadTime.value.summary);

const isEmpty = computed(() => isEmptyData((mergeLeadTime.value?.data || []) as unknown as Record<string, unknown>[]));

const formatDuration = (seconds: number): { value: number, unit: string } => {
  const duration = Duration.fromObject({ seconds });
  const value = duration.as('seconds');

  switch (true) {
    case value >= 86400:
      return {
        value: duration.as('days'),
        unit: 'days'
      };
    case value >= 3600:
      return {
        value: duration.as('hours'),
        unit: 'hours'
      };
    case value >= 60:
      return {
        value: duration.as('minutes'),
        unit: 'minutes'
      };
    default:
      return {
        value,
        unit: 'seconds'
      };
  }
};

</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
