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
      error-message="Error fetching contributor leaderboard"
      :is-empty="isEmpty"
    >
      <lfx-contributors-table
        :metric="model.metric"
        :contributors="contributors.data"
        :show-percentage="true"
      />

      <div
        v-if="!props.snapshot && !hideAllContributorsButton"
        class="mt-5 flex flex-row justify-center"
      >
        <lfx-button
          type="transparent"
          @click="isDrawerOpened = true"
        >
          All contributors
        </lfx-button>
      </div>
    </lfx-project-load-state>
  </section>
  <client-only>
    <lfx-contributor-leaderboard-drawer
      v-model="isDrawerOpened"
      :selected-metric="model.metric"
      :model="model"
    />
  </client-only>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxContributorLeaderboardDrawer from './fragments/contributor-leaderboard-drawer.vue';
import type { ContributorLeaderboard } from '~~/types/contributors/responses.types';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxActivitiesDropdown from '~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import LfxContributorsTable from '~/components/modules/widget/components/contributors/fragments/contributors-table.vue';
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service';
import { Widget } from '~/components/modules/widget/types/widget';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';
import { dateOptKeys } from '~/components/modules/project/config/date-options';

interface ContributorLeaderboardModel extends WidgetModel {
  metric: string;
}

const props = defineProps<{
  modelValue: ContributorLeaderboardModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: ContributorLeaderboardModel): void;
}>();

const model = computed<ContributorLeaderboardModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { isCollectionScope, selectedTimeRangeKey, startDate, endDate, selectedReposValues } =
  storeToRefs(useProjectStore());

const route = useRoute();
const platform = computed(() => model.value.metric?.split(':')[0]);
const activityType = computed(() => model.value.metric?.split(':')[1]);
const isDrawerOpened = ref(false);

// Maps the picker's dateOptKeys to the presetKey values materialized by
// collection_contributors_leaderboard_copy_<presetKey>.pipe (crowd.dev/services/libs/tinybird) -
// most keys already match; only these three differ in casing/pluralization.
const presetKeyByDateOptKey: Partial<Record<string, string>> = {
  [dateOptKeys.previous5Year]: 'previous5years',
  [dateOptKeys.previous10Year]: 'previous10years',
  [dateOptKeys.alltime]: 'allTime',
};

// Only collectionSlug-scoped requests have a precomputed path (collection_contributors_leaderboard
// .pipe) - "Custom" is unreachable here since date-range-picker.vue hides it for collection pages.
const presetKey = computed(() =>
  isCollectionScope.value ? presetKeyByDateOptKey[selectedTimeRangeKey.value] || selectedTimeRangeKey.value : undefined,
);

// startDate/endDate are omitted whenever presetKey is set - the pipe's precomputed path keys
// on presetKey alone and ignores startDate/endDate, so there's no need to send them (and doing
// so would be redundant with what presetKey already encodes).
const params = computed(() => ({
  projectSlug: isCollectionScope.value ? undefined : (route.params.slug as string),
  collectionSlug: isCollectionScope.value ? (route.params.slug as string) : undefined,
  platform: platform.value,
  activityType: activityType.value,
  repos: selectedReposValues.value,
  startDate: presetKey.value ? undefined : startDate.value,
  endDate: presetKey.value ? undefined : endDate.value,
  includeCollaborations: model.value.includeCollaborations,
  presetKey: presetKey.value,
}));

const { data, isSuccess, isError, status } = CONTRIBUTORS_API_SERVICE.fetchContributorLeaderboard(params);

const contributors = computed<ContributorLeaderboard>(() => data.value?.pages[0] as ContributorLeaderboard);
const hideAllContributorsButton = computed(() => contributors.value?.data.length < 10);

const isEmpty = computed(() => isEmptyData(contributors.value?.data as unknown as Record<string, unknown>[]));

watch(
  status,
  (value) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.CONTRIBUTORS_LEADERBOARD);
    }
  },
  {
    immediate: true,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsLeaderboard',
};
</script>
