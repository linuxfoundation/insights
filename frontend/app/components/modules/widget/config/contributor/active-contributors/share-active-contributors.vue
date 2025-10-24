<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
    <p class="text-xs text-neutral-500 pb-4">
      Copy and paste your <strong>Active contributors</strong> badge directly into your project's
      GitHub README file.
    </p>
    <div class="text-xs text-neutral-400 mb-4 italic">
      *Active contributors over the past 365 days
    </div>

    <lfx-active-contributor-badge />
  </div>
</template>

<script setup lang="ts">
import LfxActiveContributorBadge from '~/components/shared/modules/share/components/active-contributor-badge.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxShareActiveContributors',
};
</script>
