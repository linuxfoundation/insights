<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 overflow-hidden">
    <lfx-ai-code-tracker-report />
  </div>
</template>

<script setup lang="ts">
import LfxAiCodeTrackerReport from '~/components/modules/report/ai-code-tracker/views/ai-code-tracker-report.vue';

const title = 'AI Code Tracker | LFX Insights';
const description =
  'Track AI coding tool usage across open source projects. Monitor GitHub Copilot, ChatGPT, Claude, and other AI-assisted development trends. Powered by the Linux Foundation.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
