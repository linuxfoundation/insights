<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section :class="props.snapshot ? 'mt-2' : 'mt-5'">
    <div :class="props.snapshot ? 'mb-5' : 'mb-6'">
      <lfx-activities-dropdown
        v-model="model.metric"
        full-width
        :snapshot="props.snapshot"
        :include-collaborations="model.includeCollaborations"
      />
    </div>

    <lfx-project-load-state
      :status="isSuccess || isError ? 'success' : 'pending'"
      :error="isError"
      error-message="Error fetching organizations leaderboard"
      :is-empty="isEmpty"
    >
      <lfx-organizations-table
        :metric="model.metric"
        :organizations="organizations.data"
        :show-percentage="true"
      />

      <div
        v-if="!props.snapshot && !hideAllOrganizationsButton"
        class="mt-5 flex flex-row justify-center"
      >
        <lfx-button
          type="transparent"
          @click="isDrawerOpened = true"
        >
          All organizations
        </lfx-button>
      </div>
    </lfx-project-load-state>
    <client-only>
      <lfx-organization-leaderboard-drawer
        v-model="isDrawerOpened"
        :selected-metric="model.metric"
        :model="model"
      />
    </client-only>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxOrganizationLeaderboardDrawer from './fragments/organization-leaderboard-drawer.vue';
import type { OrganizationLeaderboard } from '~~/types/contributors/responses.types';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxActivitiesDropdown from '~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import LfxOrganizationsTable from '~/components/modules/widget/components/contributors/fragments/organizations-table.vue';
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service';
import { Widget } from '~/components/modules/widget/types/widget';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface OrganizationsLeaderboardModel extends WidgetModel {
  metric: string;
}

const props = defineProps<{
  modelValue: OrganizationsLeaderboardModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: OrganizationsLeaderboardModel): void;
}>();

const model = computed<OrganizationsLeaderboardModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { startDate, endDate, selectedReposValues } = storeToRefs(useProjectStore());

const route = useRoute();
const platform = computed(() => model.value?.metric?.split(':')[0]);
const activityType = computed(() => model.value?.metric?.split(':')[1]);
const isDrawerOpened = ref(false);

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  platform: platform.value,
  activityType: activityType.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  includeCollaborations: model.value.includeCollaborations,
}));

const { data, isSuccess, isError, status } =
  CONTRIBUTORS_API_SERVICE.fetchOrganizationLeaderboard(params);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value?.pages[0] as OrganizationLeaderboard,
);
const hideAllOrganizationsButton = computed(() => organizations.value?.data.length < 10);

const isEmpty = computed(() =>
  isEmptyData(organizations.value?.data as unknown as Record<string, unknown>[]),
);

watch(
  status,
  (value) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.ORGANIZATIONS_LEADERBOARD);
    }
  },
  {
    immediate: true,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationsLeaderboard',
};
</script>
