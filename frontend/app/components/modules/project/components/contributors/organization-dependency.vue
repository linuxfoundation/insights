<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Organization dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions across different organizations, whose contributors were actively involved in the
      project during the selected period.
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
        error-message="Error fetching organization dependency"
        :is-empty="isEmpty"
      >

        <lfx-dependency-display
          :top-dependency="topOrganizations"
          :other-dependency="otherOrganizations"
          :list="organizations"
          label="organization"
        >
          <lfx-avatar-group>
            <lfx-avatar
              v-for="orgAvatar in topOrganizationsAvatars"
              :key="orgAvatar.name"
              :name="orgAvatar.name"
              :src="orgAvatar.logo"
              type="organization"
            />
          </lfx-avatar-group>
        </lfx-dependency-display>

        <div class="font-semibold mb-5 mt-8">
          <span class="text-black">Top contributors </span>
        </div>

        <lfx-organizations-table
          show-percentage
          :metric="metric"
          :organizations="organizations"
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
import LfxOrganizationsTable from './fragments/organizations-table.vue';
import type { OrganizationDependency } from '~~/types/contributors/responses.types';
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
  TanstackKey.ORGANIZATION_DEPENDENCY,
  route.params.slug,
  platform,
  activityType,
  selectedRepository,
  startDate,
  endDate,
]);

const fetchData: QueryFunction<OrganizationDependency> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/organization-dependency`,
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
} = useQuery<OrganizationDependency>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
})

const organizationDependency = computed<OrganizationDependency>(() => data.value as OrganizationDependency);
const topOrganizations = computed(() => organizationDependency.value?.topOrganizations);
const otherOrganizations = computed(() => organizationDependency.value?.otherOrganizations);
const organizations = computed(() => organizationDependency.value?.list);

const topOrganizationsAvatars = computed(() => (organizations.value?.length
  ? organizations.value.slice(0, Math.min(3, organizations.value.length))
  : []));

const isEmpty = computed(() => isEmptyData(organizations.value as unknown as Record<string, unknown>[]));

emit('update:benchmarkValue', {
    key: BenchmarkKeys.OrganizationDependency,
    value: topOrganizations.value?.count || 0
  });

watch(topOrganizations, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.OrganizationDependency,
    value: topOrganizations.value.count
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationDependency'
};
</script>
