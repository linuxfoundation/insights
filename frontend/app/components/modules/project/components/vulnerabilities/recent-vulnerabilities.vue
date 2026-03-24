<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-center pt-6 w-full">
    <div class="flex flex-col gap-2 items-start w-full">
      <p class="text-base font-bold leading-6 text-neutral-900">Recent vulnerabilities</p>

      <div class="flex flex-col w-full">
        <!-- Table Header -->
        <div class="flex items-center w-full">
          <div class="w-[140px] py-4 pr-0 border-b border-neutral-200 flex items-center gap-1.5">
            <p class="text-sm font-medium leading-5 text-neutral-500">CVE ID</p>
            <lfx-tooltip
              content="Common Vulnerabilities and Exposures identifier"
              placement="top"
            >
              <lfx-icon
                name="question-circle"
                :size="16"
                class="text-neutral-500 cursor-help"
              />
            </lfx-tooltip>
          </div>

          <div class="w-[120px] px-3 py-4 border-b border-neutral-200">
            <p class="text-sm font-medium leading-5 text-neutral-500">Severity</p>
          </div>

          <div class="flex-1 px-3 py-4 border-b border-neutral-200">
            <p class="text-sm font-medium leading-5 text-neutral-500">Description</p>
          </div>

          <div class="w-[120px] px-3 py-4 border-b border-neutral-200">
            <p class="text-sm font-medium leading-5 text-neutral-500">Ecosystem</p>
          </div>

          <div class="w-[120px] px-3 py-4 border-b border-neutral-200">
            <p class="text-sm font-medium leading-5 text-neutral-500">Published</p>
          </div>

          <div class="w-[100px] px-3 py-4 border-b border-neutral-200 flex justify-end">
            <p class="text-sm font-medium leading-5 text-neutral-500 text-right">Status</p>
          </div>
        </div>

        <!-- Table Body -->
        <lfx-project-vulnerability-row
          v-for="vulnerability in props.vulnerabilities"
          :key="vulnerability.cveId"
          :vulnerability="vulnerability"
        />
      </div>
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
import LfxProjectVulnerabilityRow from './vulnerability-row.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
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
