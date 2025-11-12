<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-full bg-gradient-to-br bg-black flex flex-col justify-between p-16">
    <!-- Header with Logo -->
    <div class="flex items-center gap-4">
      <div class="text-white text-4xl font-bold">LFX Insights</div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center">
      <div
        class="text-center"
        style="display: flex; flex-direction: column; align-items: center"
      >
        <h1 class="text-7xl font-bold text-white leading-tight">{{ title }}</h1>
        <p
          class="text-3xl text-gray-300 max-w-4xl"
          style="margin-top: 24px"
        ></p>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="text-gray-400 text-2xl">insights.linuxfoundation.org</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: 'title',
  },
);
</script>
