<template>
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
</template>

<script setup lang="ts">
import {
ref, computed, watch, onServerPrefetch
} from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { ContributorDependency } from '~~/types/contributors/responses.types';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxActivitiesDropdown
  from "~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxDependencyDisplay from "~/components/modules/widget/components/contributors/fragments/dependency-display.vue";
import LfxContributorsTable from "~/components/modules/widget/components/contributors/fragments/contributors-table.vue";

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
