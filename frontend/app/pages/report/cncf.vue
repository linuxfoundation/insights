<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-cncf-report />
  </div>
</template>

<script setup lang="ts">
import LfxCncfReport from '~/components/modules/report/cncf/views/cncf-report.vue';

const title = 'CNCF Contributor Geographic Distribution | LFX Insights';
const description =
  'Explore the geographical distribution of contributors across all CNCF projects over time. Powered by the Linux Foundation.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
