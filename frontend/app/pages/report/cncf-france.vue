<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 overflow-hidden">
    <lfx-cncf-country-report :country="country" />
  </div>
</template>

<script setup lang="ts">
import LfxCncfCountryReport from '~/components/modules/report/cncf-country/views/cncf-country-report.vue';

const country = { code: 'FR', name: 'France', adjective: 'French' };

const title = 'Cloud Native in France | LFX Insights';
const description =
  'Explore contributions to CNCF projects from people in France and from organizations with French HQ. Powered by the Linux Foundation.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
