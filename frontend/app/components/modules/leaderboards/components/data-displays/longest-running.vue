<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <timestamp-data-display
    :data="data"
    :hide-trend="true"
  />
</template>

<script setup lang="ts">
import TimestampDataDisplay from './timestamp.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

defineProps<{
  data: Leaderboard;
}>();
</script>

<script lang="ts">
export default {
  name: 'LongestRunningDataDisplay',
  inheritAttrs: false,
};
</script>
