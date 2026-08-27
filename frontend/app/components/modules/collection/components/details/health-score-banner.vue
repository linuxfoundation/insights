<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="sm:flex-row flex-col block bg-brand-800 text-white py-2 px-5 flex items-center sm:justify-center justify-start gap-3"
  >
    <span
      class="sm:!text-xs text-2xs sm:leading-4 leading-3.5"
      v-html="sanitize(bannerText, { ADD_ATTR: ['target'] })"
    />
  </div>
</template>

<script setup lang="ts">
import { useSanitize } from '~~/composables/useSanitize';

const { sanitize } = useSanitize();

const bannerText =
  'We updated our Health Score methodology! Read more about it in our ' +
  '<a href="https://insights.linuxfoundation.org/docs/metrics/health-score/" target="_blank" rel="noopener noreferrer" class="font-bold hover:underline">docs</a>' +
  ' and join the discussion on ' +
  '<a href="https://github.com/linuxfoundation/insights/discussions/1939" target="_blank" rel="noopener noreferrer" class="font-bold hover:underline">GitHub</a>.';
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreBanner',
};
</script>
