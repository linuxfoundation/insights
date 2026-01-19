<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 1200px; height: 630px; position: relative; display: flex">
    <img
      src="/images/og-image/bg.png"
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
        height: 70px;
        font-family: 'Roboto Slab', serif;
        font-size: 56px;
        font-weight: 700;
        line-height: 1.25;
        color: #0f172a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        height: 60px;
        font-family: 'Roboto Slab', serif;
        font-size: 48px;
        line-height: 1.25;
        color: #0f172a;
        font-weight: 300;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        height: 60px;
        font-family: 'Roboto Slab', serif;
        font-size: 48px;
        line-height: 1.25;
        color: #0f172a;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        height: 108px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 36px;
        color: #0f172a;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
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
      src="/images/og-image/lfx-insights-logo.png"
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

// Strip emojis and other problematic unicode characters that can crash resvg
const stripEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      '',
    )
    .trim();
};

// Truncate project name to fit in one line (approximately 30 characters for 56px font)
const truncatedProjectName = computed(() => {
  const cleanName = stripEmojis(props.projectName);
  const maxLength = props.repositoryName ? 29 : 24;
  if (cleanName.length <= maxLength) {
    return cleanName;
  }
  return cleanName.substring(0, maxLength).trim() + '...';
});

// Truncate repository name to fit in one line (approximately 35 characters for 48px font)
const truncatedRepositoryName = computed(() => {
  const cleanName = stripEmojis(props.repositoryName);
  const maxLength = 29;
  if (cleanName.length <= maxLength) {
    return cleanName;
  }
  return cleanName.substring(0, maxLength).trim() + '...';
});

// Truncate description to fit in 3 lines (approximately 150 characters)
const truncatedDescription = computed(() => {
  const cleanDescription = stripEmojis(props.projectDescription);
  const maxLength = 150;
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }
  return cleanDescription.substring(0, maxLength).trim() + '...';
});
</script>
