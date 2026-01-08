<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 1200px; height: 630px; position: relative; display: flex">
    <img
      src="/images/og-image/bg.svg"
      alt=""
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    />
    <!-- Title - Project Only -->
    <div
      v-if="!repositoryName"
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        width: 807px;
        font-family: 'Roboto Slab', serif;
        font-size: 56px;
        font-weight: 700;
        line-height: 1.25;
        color: #0f172a;
      "
    >
      {{ truncatedProjectName }}
    </div>

    <!-- Title - Project with Repository -->
    <div
      v-if="repositoryName"
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        width: 807px;
        font-family: 'Roboto Slab', serif;
        font-size: 48px;
        line-height: 1.25;
        color: #0f172a;
        font-weight: 300;
      "
    >
      {{ truncatedProjectName }}
    </div>
    <div
      v-if="repositoryName"
      style="
        position: absolute;
        left: 80px;
        top: 140px;
        width: 807px;
        font-family: 'Roboto Slab', serif;
        font-size: 48px;
        line-height: 1.25;
        color: #0f172a;
        font-weight: 700;
      "
    >
      / {{ truncatedRepositoryName }}
    </div>

    <!-- Description -->
    <div
      style="
        position: absolute;
        left: 80px;
        width: 807px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 1.5;
        color: #0f172a;
      "
      :style="{
        top: repositoryName ? '224px' : '174px',
      }"
    >
      {{ truncatedDescription }}
    </div>

    <!-- Project Logo Box -->
    <div
      style="
        position: absolute;
        left: 960px;
        top: 80px;
        width: 160px;
        height: 160px;
        background: white;
        border: 1px solid #e2e8f0;
        padding: 10px;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        v-if="projectLogo"
        :src="projectLogo"
        alt="Project logo"
        :width="140"
        :height="140"
        :style="{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
        }"
      />
    </div>

    <!-- LFX Insights Logo -->
    <img
      src="/images/lfx-insights-logo.svg"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    projectName?: string;
    projectDescription?: string;
    repositoryName?: string;
    projectLogo?: string;
  }>(),
  {
    projectName: '',
    projectDescription: '',
    repositoryName: '',
    projectLogo: '',
  },
);

// Truncate project name to fit in one line (approximately 30 characters for 56px font)
const truncatedProjectName = computed(() => {
  const maxLength = props.repositoryName ? 29 : 24;
  if (props.projectName.length <= maxLength) {
    return props.projectName;
  }
  return props.projectName.substring(0, maxLength).trim() + '...';
});

// Truncate repository name to fit in one line (approximately 35 characters for 48px font)
const truncatedRepositoryName = computed(() => {
  const maxLength = 29;
  if (props.repositoryName.length <= maxLength) {
    return props.repositoryName;
  }
  return props.repositoryName.substring(0, maxLength).trim() + '...';
});

// Truncate description to fit in 3 lines (approximately 150 characters)
const truncatedDescription = computed(() => {
  const maxLength = 150;
  if (props.projectDescription.length <= maxLength) {
    return props.projectDescription;
  }
  return props.projectDescription.substring(0, maxLength).trim() + '...';
});
</script>
