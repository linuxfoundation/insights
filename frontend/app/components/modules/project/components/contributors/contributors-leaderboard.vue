<template>
  <lfx-card :class="props.showFullList ? 'h-full' : 'p-4 sm:p-6'">
    <div :class="props.showFullList ? 'flex flex-col justify-start h-full' : ''">
      <div :class="props.showFullList ? 'pt-4 sm:pt-6 px-4 sm:px-6' : ''">
        <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributors leaderboard</h3>
        <p class="text-body-2 text-neutral-500 mb-6">
          Contributor ranking based on the number of activities performed and the impact on the project.
          <a
            :href="links.learnMore"
            class="text-brand-500"
            target="_blank"
          >Learn more</a>
        </p>

        <hr>
      </div>
      <section
        class="mt-5"
        :class="props.showFullList ? 'flex flex-col flex-grow overflow-auto' : ''"
      >
        <div
          class="mb-6"
          :class="props.showFullList ? 'px-4 sm:px-6 pt-[1px]' : ''"
        >
          <lfx-activities-dropdown
            v-model="metric"
            full-width
          />
        </div>

        <lfx-project-load-state
          :status="offset > 0 ? 'success' : status"
          :error="error"
          error-message="Error fetching contributor leaderboard"
          :is-empty="isEmpty"
        >
          <lfx-contributors-table
            :metric="metric"
            :contributors="props.showFullList ? tableData : contributors.data"
            :show-full-list="props.showFullList"
            :total="contributors.meta.total"
            @load-more="loadMore"
          />

          <div
            v-if="!props.showFullList"
            class="mt-5 flex flex-row justify-center"
          >
            <lfx-button
              type="transparent"
              @click="emit('showFullList', 'contributors-leaderboard', metric || 'all:all')"
            >
              All contributors
            </lfx-button>
          </div>
        </lfx-project-load-state>
      </section>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import {
 ref, computed, watch, type Ref
} from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxActivitiesDropdown from './fragments/activities-dropdown.vue';
import LfxContributorsTable from './fragments/contributors-table.vue';
import type { ContributorLeaderboard, Contributor } from '~~/types/contributors/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';
import LfxButton from "~/components/uikit/button/button.vue";

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const emit = defineEmits<{(e: 'showFullList', name: string, activityType: string): void
}>();
const props = withDefaults(defineProps<{
  showFullList?: boolean,
  selectedMetric?: string
}>(), {
  showFullList: false,
  selectedMetric: 'all:all'
});

const route = useRoute();
const metric = ref(props.selectedMetric);
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);
const offset = ref(0);

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/contributor-leaderboard`,
  {
    params: {
      platform,
      activityType,
      repository: selectedRepository,
      startDate,
      endDate,
      limit: 10,
      offset
    },
    // this prevents the other copy of this component from re-fetching data
    key: `contributors-leaderboard-${props.showFullList ? 'full' : 'short'}`
  }
);

const contributors = computed<ContributorLeaderboard>(() => data.value as ContributorLeaderboard);
const tableData = ref<Contributor[]>([]);

const isEmpty = computed(() => isEmptyData(contributors.value?.data as unknown as Record<string, unknown>[]));

const loadMore = () => {
  offset.value += 10;
};
watch(data as Ref<ContributorLeaderboard>, (newData: ContributorLeaderboard) => {
  tableData.value = [...tableData.value, ...(newData.data as Contributor[])];
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsLeaderboard'
};
</script>
