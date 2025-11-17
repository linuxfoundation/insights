<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <integer-data-display
    :data="data"
    :is-trend-hidden="true"
  />
</template>

<script setup lang="ts">
import IntegerDataDisplay from './integer.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

defineProps<{
  data: Leaderboard;
}>();
</script>

<script lang="ts">
export default {
  name: 'CodebaseSizeDataDisplay',
  inheritAttrs: false,
};
</script>
