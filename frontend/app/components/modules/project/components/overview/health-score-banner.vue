<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="p-3 bg-neutral-100 border border-neutral-200 flex items-center gap-1.5 rounded-md">
    <lfx-icon
      name="info-circle"
      :size="14"
      class="text-neutral-500 flex-shrink-0"
    />
    <p
      class="text-xs leading-4 font-semibold text-neutral-500"
      v-html="sanitize(bannerText, { ADD_ATTR: ['target'] })"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useSanitize } from '~~/composables/useSanitize';

const { sanitize } = useSanitize();

const bannerText =
  'We updated our Health Score methodology! Read more about it in our ' +
  '<a href="https://insights.linuxfoundation.org/docs/metrics/health-score/" target="_blank" rel="noopener noreferrer" class="underline">docs</a>' +
  ' and join the discussion on ' +
  '<a href="https://github.com/linuxfoundation/insights/discussions/1939" target="_blank" rel="noopener noreferrer" class="underline">GitHub</a>.';
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreBanner',
};
</script>
