<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 overflow-hidden">
    <lfx-agentic-ai-momentum-report />
  </div>
</template>

<script setup lang="ts">
import LfxAgenticAiMomentumReport from '~/components/modules/report/agentic-ai-momentum/views/agentic-ai-momentum-report.vue';

const title = 'Agentic AI Momentum | LFX Insights';
const description =
  'Track the 100 most critical agentic AI projects across 11 ecosystem layers. Monitor GitHub activity, arXiv research trends, and community health metrics. Powered by the Linux Foundation.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
