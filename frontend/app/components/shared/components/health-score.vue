<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tag
    v-if="props.score >= 80"
    variation="positive-solid"
  >
    Excellent
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 60"
    variation="positive"
  >
    Healthy
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 40"
    variation="info"
  >
    Stable
  </lfx-tag>
  <lfx-tag
    v-else-if="props.score >= 20"
    variation="warning"
  >
    Unsteady
  </lfx-tag>
  <lfx-tag
    v-else
    variation="negative-solid"
  >
    Critical
  </lfx-tag>
</template>

<script setup lang="ts">
import LfxTag from "~/components/uikit/tag/tag.vue";

const props = defineProps<{
  score: number
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScore',
}
</script>
