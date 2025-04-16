<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributor dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions among different contributors, highlighting key individuals who are actively
      involved in the project during the selected time period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>

    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <lfx-activities-dropdown v-model="metric" />
      </div>
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching contributor dependency"
        :is-empty="isEmpty"
        use-min-height
      >

        <lfx-dependency-display
          :top-dependency="topContributors"
          :other-dependency="otherContributors"
          :list="contributors"
          label="contributor"
        >
          <lfx-avatar-group>
            <lfx-avatar
              v-for="avatar in contributorsAvatars"
              :key="avatar.name"
              :name="avatar.name"
              :src="avatar.avatar"
              type="member"
            />
          </lfx-avatar-group>
        </lfx-dependency-display>

        <div class="font-semibold mb-5 mt-8">
          <span class="text-black">Top contributors </span>
        </div>

        <lfx-contributors-table
          show-percentage
          :metric="metric"
          :contributors="contributors"
        />
      </lfx-project-load-state>

    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import {
ref, computed, watch, onServerPrefetch
} from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxDependencyDisplay from './fragments/dependency-display.vue';
import LfxContributorsTable from './fragments/contributors-table.vue';
import type { ContributorDependency } from '~~/types/contributors/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxActivitiesDropdown
  from '~/components/modules/project/components/contributors/fragments/activities-dropdown.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark): void;
}>();

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all:all');
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);
const queryKey = computed(() => [
  TanstackKey.CONTRIBUTOR_DEPENDENCY,
  route.params.slug,
  platform,
  activityType,
  selectedRepository,
  startDate,
  endDate,
]);

const fetchData: QueryFunction<ContributorDependency> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/contributor-dependency`,
    {
  params: {
    platform: platform.value,
    activityType: activityType.value,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
data, status, error, suspense
} = useQuery<ContributorDependency>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
})

const contributorDependency = computed<ContributorDependency>(() => data.value as ContributorDependency);

const topContributors = computed(() => contributorDependency.value?.topContributors);
const otherContributors = computed(() => contributorDependency.value?.otherContributors);
const contributors = computed(() => contributorDependency.value?.list);

const contributorsAvatars = computed(() => (contributors.value?.length
  ? contributors.value.slice(0, Math.min(5, topContributors.value.count))
  : []));

const isEmpty = computed(() => isEmptyData(contributors.value as unknown as Record<string, unknown>[]));

emit('update:benchmarkValue', {
    key: BenchmarkKeys.ContributorDependency,
    value: topContributors.value?.count || 0
  });

watch(topContributors, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.ContributorDependency,
    value: topContributors.value.count
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorDependency'
};
</script>
