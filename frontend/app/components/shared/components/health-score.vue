<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Labels below use the v2 health score convention (excellent/healthy/fair/concerning/critical,
  see collection-health-score-pill.vue) for consistency with the rest of the app. The score
  itself is still v1 here — osi-list-projects.vue and osi-list-collections.vue (this component's
  only callers) read healthScore from projects_list/collections_oss_index, neither of which
  carries v2 fields. Wiring these lists to v2 needs a data-layer follow-up.
-->
<template>
  <lfx-tag
    v-if="props.unavailable"
    variation="default"
  >
    Unavailable
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 85"
    variation="positive-solid"
  >
    Excellent
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 70"
    variation="positive"
  >
    Healthy
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 50"
    variation="info"
  >
    Fair
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 30"
    variation="warning"
  >
    Concerning
  </lfx-tag>
  <lfx-tag
    v-else
    variation="negative-solid"
  >
    Critical
  </lfx-tag>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';

const props = defineProps<{
  score: number;
  unavailable?: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScore',
};
</script>
