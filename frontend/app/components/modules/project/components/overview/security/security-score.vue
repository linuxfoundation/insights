<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>Result: {{results}}</div>
  <div>
    Label: {{config.label}}
  </div>
  <div>
    Description: {{config.description}}
  </div>
  {{selectedRepository}}
</template>

<script lang="ts" setup>
import {computed, onServerPrefetch} from "vue";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import {useRoute} from "nuxt/app";
import {storeToRefs} from "pinia";
import {TanstackKey} from "~/components/shared/types/tanstack";
import type {SecurityData} from "~~/types/security/responses.types";
import {PROJECT_SECURITY_SERVICE} from "~/components/modules/project/services/security.service";
import type {OspsBaselineScore} from "~/components/modules/project/config/osps-baseline-score";
import {lfxColors} from "~/config/styles/colors";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const route = useRoute();
const { selectedRepository } = storeToRefs(useProjectStore());

const queryKey = computed(() => [
  TanstackKey.SECURITY_ASSESSMENT,
  route.params.slug,
  selectedRepository,
]);

const fetchData: QueryFunction<SecurityData[]> = async () => $fetch(
    `/api/project/${route.params.slug}/security/assessment`,
    {
      query: {
        repo: selectedRepository || undefined,
      }
    }
);

const {
  data, suspense, error, isFetching
} = useQuery<SecurityData[]>({
  queryKey,
  queryFn: fetchData,
});

const results = computed(
    () => PROJECT_SECURITY_SERVICE.calculateOSPSScore((data.value || []), !!selectedRepository.value)
);

const config = computed<OspsBaselineScore>(() => {
  if(isFetching.value){
    return {
      minScore: 0,
      maxScore: 100,
      loading: true,
      label: '',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.white,
      badgeTextColor: lfxColors.white,
    }
  }
  if((data.value || []).length === 0 || error.value){
    return {
      minScore: 0,
      maxScore: 100,
      label: 'No data available',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.neutral[100],
      badgeTextColor: lfxColors.neutral[500],
    }
  }
  return PROJECT_SECURITY_SERVICE.getOSPSconfig(results.value);
})

onServerPrefetch(async () => {
  await suspense()
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityScore',
}
</script>
