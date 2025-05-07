<template>
  <lfx-tag
    v-if="data"
    :variation="data.variation"
    v-bind="$attrs"
  >
    <lfx-icon
      :name="data.icon"
      class="font-black"
    />
    {{ data.text }}
  </lfx-tag>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";
import {SecurityDataResult} from "~~/types/security/responses.types";

const props = defineProps<{
  results: SecurityDataResult[]
}>()

interface TypeData {
  variation: string;
  icon: string;
  text: string;
}

const typeData: Record<SecurityDataResult, TypeData> = {
  [SecurityDataResult.FAILED]: {
    variation: 'negative',
    icon: 'exclamation-circle',
    text: 'Failed',
  },
  [SecurityDataResult.PASSED]: {
    variation: 'positive',
    icon: 'check-circle',
    text: 'Passed',
  },
  [SecurityDataResult.NEEDS_REVIEW]: {
    variation: 'warning',
    icon: 'exclamation-triangle',
    text: 'Needs review',
  },
}
const result = computed<SecurityDataResult>(() => {
  if(props.results.includes(SecurityDataResult.FAILED)) {
    return SecurityDataResult.FAILED;
  }
  if(props.results.includes(SecurityDataResult.NEEDS_REVIEW)) {
    return SecurityDataResult.NEEDS_REVIEW;
  }
  return SecurityDataResult.PASSED;
});

const data = computed(() => typeData[result.value as SecurityDataResult]);

</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationResult',
}
</script>
