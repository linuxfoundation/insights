<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 overflow-hidden">
    <lfx-health-score-coverage-report />
  </div>
</template>

<script setup lang="ts">
import LfxHealthScoreCoverageReport from '~/components/modules/report/health-score-coverage/views/health-score-coverage-report.vue';

const title = 'Health Score Coverage | LFX Insights';
const description =
  'Where every project tracked in LFX Insights lands on the health score, and how much of the underlying data we can actually see.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
