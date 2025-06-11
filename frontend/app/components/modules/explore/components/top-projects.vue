<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  explore top projects
  <div v-if="isFullList">
    show full list here
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFullList?: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopProjects'
};
</script>
