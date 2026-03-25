<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-center pt-6 w-full">
    <div class="flex flex-col gap-2 items-start w-full">
      <p class="text-base font-bold leading-6 text-neutral-900">Recent vulnerabilities</p>

      <lfx-project-vulnerability-table :vulnerabilities="props.vulnerabilities" />
    </div>

    <!-- View More Button -->
    <lfx-button
      v-if="props.showViewMore"
      type="ghost"
      label="View more"
      class="!rounded-full hover:!bg-accent-100 hover:!text-accent-500"
      @click="emit('viewMore')"
    />
  </div>
</template>

<script setup lang="ts">
import LfxProjectVulnerabilityTable from './vulnerability-table.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import type { Vulnerability } from '~~/types/vulnerabilities/responses.types';

const props = withDefaults(
  defineProps<{
    vulnerabilities: Vulnerability[];
    showViewMore?: boolean;
  }>(),
  {
    showViewMore: true,
  },
);

const emit = defineEmits<{
  (e: 'viewMore'): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRecentVulnerabilities',
};
</script>
