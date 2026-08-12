<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section :class="props.snapshot ? 'mt-2' : 'mt-5'">
    <div
      class="flex flex-wrap md:flex-nowrap flex-row justify-between gap-4 items-center"
      :class="props.snapshot ? 'mb-5' : 'mb-10'"
    >
      <lfx-tabs
        v-if="!props.snapshot"
        :tabs="tabs"
        :model-value="model.activeTab"
        width-type="inline"
        @update:model-value="model.activeTab = $event"
      />
      <div class="max-w-max">
        <lfx-activities-dropdown
          v-model="model.metric"
          placement="bottom-end"
          :full-width="false"
          :match-width="false"
          width="25rem"
          :snapshot="props.snapshot"
          :include-collaborations="model.includeCollaborations"
        />
      </div>
    </div>
    <div v-if="props.snapshot">
      <div class="text-sm leading-4 font-semibold first-letter:uppercase pb-5">{{ model.activeTab }} distribution</div>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching geographical distribution"
      :is-empty="isEmpty"
    >
      <lfx-geo-distribution-view
        v-if="status !== 'pending'"
        :geo-map-data="geoMapData"
        :label="label"
        :limit="5"
        :animation="!props.snapshot"
      />
      <div
        v-if="!props.snapshot && showAllCountriesButton"
        class="mt-5 flex flex-row justify-center"
      >
        <lfx-button
          type="transparent"
          @click="isDrawerOpened = true"
        >
          All countries
        </lfx-button>
      </div>
    </lfx-project-load-state>
  </section>
  <lfx-geographical-distribution-drawer
    v-if="isDrawerOpened"
    v-model="isDrawerOpened"
    :selected-tab="model.activeTab"
    :selected-metric="model.metric"
    :model="model"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import LfxGeoDistributionView from './fragments/geo-distribution-view.vue';
import LfxGeographicalDistributionDrawer from './fragments/geographical-distribution-drawer.vue';
import { filterKnownCountries } from './geo-map.helper';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import type {
  GeoMapData,
  GeoMapResponse,
} from '~/components/modules/widget/components/contributors/types/geo-map.types';
import LfxActivitiesDropdown from '~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { Widget } from '~/components/modules/widget/types/widget';
import {
  CONTRIBUTORS_API_SERVICE,
  type GeographicalDistributionQueryParams,
} from '~~/app/components/modules/widget/services/contributors.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface GeographicalDistributionModel extends WidgetModel {
  metric: string;
  activeTab: string;
  includeCollaborations?: boolean;
}

const props = defineProps<{
  modelValue: GeographicalDistributionModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: GeographicalDistributionModel): void;
}>();

const model = computed<GeographicalDistributionModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const route = useRoute();
const platform = computed(() => model.value.metric.split(':')[0]);
const activityType = computed(() => model.value.metric.split(':')[1]);
const { isCollectionScope, startDate, endDate, selectedReposValues } = storeToRefs(useProjectStore());

const params = computed<GeographicalDistributionQueryParams>(() => ({
  projectSlug: isCollectionScope.value ? undefined : (route.params.slug as string),
  collectionSlug: isCollectionScope.value ? (route.params.slug as string) : undefined,
  type: model.value.activeTab,
  platform: platform.value,
  activityType: activityType.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  includeCollaborations: model.value.includeCollaborations,
}));

const { data, status, error } = CONTRIBUTORS_API_SERVICE.fetchGeographicalDistribution(params);
const isDrawerOpened = ref(false);

const geoMapData = computed<GeoMapData[] | undefined>(() => (data.value as GeoMapResponse)?.data);
const knownGeoMapData = computed(() => filterKnownCountries(geoMapData.value));
const showAllCountriesButton = computed(() => knownGeoMapData.value.length > 5);

const isEmpty = computed(() => isEmptyData(knownGeoMapData.value as unknown as Record<string, unknown>[]));

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

const label = computed(() => (model.value.activeTab === 'contributors' ? 'Contributor' : 'Organization'));

watch(
  status,
  (value) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.GEOGRAPHICAL_DISTRIBUTION);
    }
  },
  {
    immediate: true,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGeographicalDistribution',
};
</script>
