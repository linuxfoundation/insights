<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section
    :class="props.snapshot ? 'mt-2' : 'mt-5'"
  >
    <div
      :class="props.snapshot ? 'mb-5' : 'mb-6'"
    >
      <lfx-activities-dropdown
        v-model="model.metric"
        full-width
        :snapshot="props.snapshot"
      />
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
        :metric="model.metric"
        :organizations="organizations"
      />
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import {
 computed, watch, onServerPrefetch
} from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { OrganizationDependency } from '~~/types/contributors/responses.types';
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
import LfxOrganizationsTable
  from "~/components/modules/widget/components/contributors/fragments/organizations-table.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface OrganizationDependencyModel {
  metric: string;
}

const props = defineProps<{
  modelValue: OrganizationDependencyModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark | undefined): void;
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: OrganizationDependencyModel): void}>()

const model = computed<OrganizationDependencyModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const platform = computed(() => model.value.metric.split(':')[0]);
const activityType = computed(() => model.value.metric.split(':')[1]);
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
  ? organizations.value.slice(0, Math.min(3, topOrganizations.value?.count || 0))
  : []));

const isEmpty = computed(() => isEmptyData(organizations.value as unknown as Record<string, unknown>[]));

const callEmit = () => {
  emit('update:benchmarkValue', status.value === 'success' ? {
    key: BenchmarkKeys.OrganizationDependency,
    value: topOrganizations.value?.count || 0
  } : undefined);
}

callEmit();

watch(topOrganizations, callEmit);

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.ORGANIZATION_DEPENDENCY);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationDependency'
};
</script>
