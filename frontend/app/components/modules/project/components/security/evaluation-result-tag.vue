<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tag
    v-if="data"
    :variation="data.variation"
    v-bind="$attrs"
  >
    <lfx-icon
      :name="data.icon"
      :size="12"
      class="font-black"
    />
    {{ data.text }}
  </lfx-tag>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';
import { SecurityDataResult } from '~~/types/security/responses.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  result: SecurityDataResult;
}>();

interface TypeData {
  variation: string;
  icon: string;
  text: string;
}

const typeData: Record<SecurityDataResult, TypeData> = {
  [SecurityDataResult.FAILED]: {
    variation: 'negative-solid',
    icon: 'exclamation-circle',
    text: 'Failed',
  },
  [SecurityDataResult.PASSED]: {
    variation: 'positive-solid',
    icon: 'check',
    text: 'Passed',
  },
  [SecurityDataResult.NEEDS_REVIEW]: {
    variation: 'neutral',
    icon: 'question-circle',
    text: 'Cannot measure',
  },
};
const data = computed<TypeData>(() => typeData[props.result]);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationResultTag',
};
</script>
