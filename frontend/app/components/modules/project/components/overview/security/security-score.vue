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
import {computed} from "vue";
import {storeToRefs} from "pinia";
import type {SecurityData} from "~~/types/security/responses.types";
import {PROJECT_SECURITY_SERVICE} from "~/components/modules/project/services/security.service";
import type {OspsBaselineScore} from "~/components/modules/project/config/osps-baseline-score";
import {lfxColors} from "~/config/styles/colors";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const { selectedRepository } = storeToRefs(useProjectStore());

const props = defineProps<{
  data: SecurityData[];
}>();

// const queryKey = computed(() => [
//   TanstackKey.SECURITY_ASSESSMENT,
//   route.params.slug,
//   selectedRepository,
// ]);

// const fetchData: QueryFunction<SecurityData[]> = async () => $fetch(
//     `/api/project/${route.params.slug}/security/assessment`,
//     {
//       query: {
//         repo: selectedRepository || undefined,
//       }
//     }
// );

// const {
//   data, suspense, error, isFetching
// } = useQuery<SecurityData[]>({
//   queryKey,
//   queryFn: fetchData,
// });

const results = computed(
    () => PROJECT_SECURITY_SERVICE.calculateOSPSScore((props.data || []), !!selectedRepository.value)
);

const config = computed<OspsBaselineScore>(() => {
  if((props.data || []).length === 0){
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
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityScore',
}
</script>
