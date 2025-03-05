<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Merge lead time
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
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
              :item-value="mergeLeadTime.data.pickup"
            />
            <lfx-merge-lead-item
              title="Review"
              description="Review started"
              icon="eye"
              :item-value="mergeLeadTime.data.review"
            />
            <lfx-merge-lead-item
              title="Accepted"
              description="Pull request accepted"
              icon="check-circle"
              :item-value="mergeLeadTime.data.accepted"
            />
            <lfx-merge-lead-item
              title="Merged"
              description=""
              icon="thumbs-up"
              :item-value="mergeLeadTime.data.pickup"
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
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { MergeLeadTime } from './types/merge-lead-time.types';
import LfxMergeLeadItem from './fragments/merge-lead-item.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { Summary } from '~/components/shared/types/summary.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

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

const summary = computed<Summary>(() => mergeLeadTime.value.summary);

const isEmpty = computed(() => isEmptyData(mergeLeadTime.value.data as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
