<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-header
    :project="data"
  />
  <div>
    <div v-if="isLoading || projectIsOnboarded">
      <nuxt-page />
    </div>
    <div
      v-else-if="!isLoading && !projectIsOnboarded"
      class="w-full flex justify-center py-20 text-neutral-500 text-sm"
    >
      This project hasn't been onboarded to LFX Insights.
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  createError,
  showError,
  useRoute,
} from "nuxt/app";
import {storeToRefs} from "pinia";
import {
computed, onServerPrefetch, watch
} from "vue";
import {useQuery} from "@tanstack/vue-query";
import type {Project} from "~~/types/project";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";
import {
  useProjectStore,
  defaultTimeRangeKey,
  defaultDateOption
} from "~/components/modules/project/store/project.store";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {PROJECT_API_SERVICE} from "~/components/modules/project/services/project.api.service";
import { useQueryParam } from "~/components/shared/utils/query-param";
import {
  processTimeAndDateParams,
  timeAndDateParamsSetter
} from "~/components/modules/project/services/project.query.service";
import { dateOptKeys } from "~/components/modules/project/config/date-options";

const route = useRoute();
const {slug} = route.params;
const {
project, selectedTimeRangeKey, startDate, endDate, isProjectLoading
} = storeToRefs(useProjectStore());

const { queryParams } = useQueryParam(processTimeAndDateParams, timeAndDateParamsSetter);
const queryKey = computed(() => [TanstackKey.PROJECT, slug]);

const {
  isLoading,
  data,
  suspense,
  isError,
  error
} = useQuery<Project>({
  queryKey,
  queryFn: PROJECT_API_SERVICE.fetchProject(slug as string),
  retry: false,
});

const projectIsOnboarded = computed(() => !!project.value?.contributorCount || !!project.value?.organizationCount);

onServerPrefetch(async () => {
  await suspense();
  if (isError.value) {
    const statusMessage = error.value?.message || 'Project Not Found';

    if (import.meta.server) {
      throw createError({ statusCode: 404, statusMessage });
    } else {
      showError({ statusCode: 404, statusMessage });
    }
  }
  if(data.value) {
    project.value = data.value;
  }
})

watch(() => data.value, (value) => {
  if (value) {
    project.value = value;
    const { timeRange, start, end } = queryParams.value;
    selectedTimeRangeKey.value = timeRange || defaultTimeRangeKey;
    startDate.value = selectedTimeRangeKey.value === dateOptKeys.alltime
      ? null : start || defaultDateOption?.startDate || null;
    endDate.value = selectedTimeRangeKey.value === dateOptKeys.alltime
      ? null : end || defaultDateOption?.endDate || null;

    queryParams.value = {
      timeRange: selectedTimeRangeKey.value,
      start: startDate.value,
      end: endDate.value,
    };
  }
}, { immediate: true });

watch(() => isLoading.value, (value) => {
  isProjectLoading.value = value;
}, { immediate: true })
</script>
