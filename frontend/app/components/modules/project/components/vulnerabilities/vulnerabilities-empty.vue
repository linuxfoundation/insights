<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-center justify-center py-10 w-full border border-neutral-200 rounded-lg">
    <div class="bg-accent-100 p-4 rounded-full flex items-center justify-center size-14">
      <lfx-icon
        name="ban-bug"
        class="text-accent-600"
        :size="32"
      />
    </div>
    <div class="flex flex-col gap-3 items-center">
      <p class="text-xl font-secondary font-bold text-black">No vulnerabilities found</p>
      <slot>
        <p class="text-sm text-neutral-600">
          We didn’t detect any vulnerabilities across the selected repositories’ dependencies over the past 365 days
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxVulnerabilitiesEmpty',
};
</script>
