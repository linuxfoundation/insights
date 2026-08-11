<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-drawer
    v-model="isDrawerOpen"
    position="right"
  >
    <div class="relative flex flex-col justify-start h-full">
      <div class="pt-4 sm:pt-6 px-4 sm:px-6">
        <h3 class="text-heading-3 font-semibold font-secondary pb-3">
          {{ geographicalDistribution.name }}
        </h3>
        <p class="text-body-2 text-neutral-500 mb-6">
          {{ geographicalDistribution.description(project!, props.model) }}
          <a
            :href="geographicalDistribution.learnMoreLink"
            class="text-brand-500"
            target="_blank"
            >Learn more</a
          >
        </p>

        <hr />
      </div>
      <section class="mt-5 flex flex-col flex-grow overflow-auto">
        <div class="flex flex-wrap gap-4 items-center justify-between mb-6 px-4 sm:px-6 pt-[1px]">
          <lfx-tabs
            :tabs="tabs"
            :model-value="activeTab"
            width-type="inline"
            @update:model-value="activeTab = $event"
          />
          <div class="max-w-max">
            <lfx-activities-dropdown
              v-model="metric"
              placement="bottom-end"
              :full-width="false"
              :match-width="false"
              width="25rem"
              :include-collaborations="props.model.includeCollaborations"
            />
          </div>
        </div>

        <div class="px-4 sm:px-6">
          <lfx-project-load-state
            :status="status"
            :error="error"
            error-message="Error fetching geographical distribution"
            :is-empty="isEmpty"
          >
            <lfx-geo-distribution-view
              :geo-map-data="geoMapData"
              :label="label"
            />
          </lfx-project-load-state>
        </div>
      </section>
    </div>
  </lfx-drawer>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxGeoDistributionView from './geo-distribution-view.vue';
import LfxDrawer from '~/components/uikit/drawer/drawer.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxActivitiesDropdown from '~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import geographicalDistribution from '~/components/modules/widget/config/contributor/geographical-distribution/geographical-distribution.config';
import type {
  GeoMapData,
  GeoMapResponse,
} from '~/components/modules/widget/components/contributors/types/geo-map.types';
import {
  CONTRIBUTORS_API_SERVICE,
  type GeographicalDistributionQueryParams,
} from '~~/app/components/modules/widget/services/contributors.api.service';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    selectedTab?: string;
    selectedMetric?: string;
    model: { includeCollaborations?: boolean };
  }>(),
  {
    modelValue: false,
    selectedTab: 'organizations',
    selectedMetric: 'all:all',
    model: () => ({ includeCollaborations: false }),
  },
);

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const route = useRoute();
const activeTab = ref(props.selectedTab);
const metric = ref(props.selectedMetric);
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);

const { isCollectionScope, startDate, endDate, selectedReposValues, project } = storeToRefs(useProjectStore());

const params = computed<GeographicalDistributionQueryParams>(() => ({
  projectSlug: isCollectionScope.value ? undefined : (route.params.slug as string),
  collectionSlug: isCollectionScope.value ? (route.params.slug as string) : undefined,
  type: activeTab.value,
  platform: platform.value,
  activityType: activityType.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  includeCollaborations: props.model.includeCollaborations,
}));

const { data, status, error } = CONTRIBUTORS_API_SERVICE.fetchGeographicalDistribution(params);

const geoMapData = computed<GeoMapData[] | undefined>(() => (data.value as GeoMapResponse)?.data);

const isEmpty = computed(() => isEmptyData(geoMapData.value as unknown as Record<string, unknown>[]));

const tabs = [
  {
    label: 'Organizations',
    value: 'organizations',
  },
  {
    label: 'Contributors',
    value: 'contributors',
  },
];

const label = computed(() => (activeTab.value === 'contributors' ? 'Contributor' : 'Organization'));

watch(isDrawerOpen, (isOpen) => {
  if (isOpen) {
    activeTab.value = props.selectedTab;
    metric.value = props.selectedMetric;
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxGeographicalDistributionDrawer',
};
</script>
