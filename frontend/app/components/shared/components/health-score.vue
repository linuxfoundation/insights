<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tag
    v-if="band === 'excellent'"
    variation="positive-solid"
  >
    Excellent
  </lfx-tag>
  <lfx-tag
    v-else-if="band === 'healthy'"
    variation="positive"
  >
    Healthy
  </lfx-tag>
  <lfx-tag
    v-else-if="band === 'fair'"
    variation="accent"
  >
    Fair
  </lfx-tag>
  <lfx-tag
    v-else-if="band === 'concerning'"
    variation="warning"
  >
    Concerning
  </lfx-tag>
  <lfx-tag
    v-else-if="band === 'critical'"
    variation="negative-solid"
  >
    Critical
  </lfx-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LfxTag from '~/components/uikit/tag/tag.vue';

// The band comes from the server-side healthLabel, which already accounts for partial scores.
const props = defineProps<{
  label: string;
}>();

const band = computed(() => props.label.toLowerCase());
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScore',
};
</script>
