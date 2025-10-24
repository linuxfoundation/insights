<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <slot :result="result">
    <lfx-tag
      variation="info"
      v-bind="$attrs"
    >
      {{ result }}%
    </lfx-tag>
  </slot>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';
import { SecurityDataResult } from '~~/types/security/responses.types';

const props = defineProps<{
  results: SecurityDataResult[];
}>();

const result = computed<number>(() => {
  const passed = props.results.filter((result) => result === SecurityDataResult.PASSED).length || 0;
  const failed = props.results.filter((result) => result === SecurityDataResult.FAILED).length || 0;

  const total = passed + failed;
  if (total === 0) {
    return 100;
  }
  return Math.round((passed / total) * 100);
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationResult',
};
</script>
