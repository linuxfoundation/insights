<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-center pt-6 w-full">
    <div class="flex flex-col gap-2 items-start w-full">
      <p class="text-base font-bold leading-6 text-neutral-900">Recent vulnerabilities</p>

      <!-- Loading state -->
      <div
        v-if="isFetching"
        class="flex items-center justify-center py-10 w-full"
      >
        <lfx-spinner
          :size="24"
          type="light"
          class="text-neutral-300"
        />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="flex items-center justify-center py-10 w-full"
      >
        <p class="text-neutral-500 text-sm">Failed to load vulnerabilities</p>
      </div>

      <!-- Data display -->
      <lfx-project-vulnerability-table
        v-else-if="data && data.length > 0"
        :vulnerabilities="data"
      />

      <!-- Empty state -->
      <div
        v-else
        class="flex items-center justify-center py-10 w-full"
      >
        <p class="text-neutral-500 text-sm">No recent vulnerabilities</p>
      </div>
    </div>

    <!-- View More Button -->
    <lfx-button
      v-if="props.showViewMore && data && data.length > 0"
      type="ghost"
      label="View more"
      class="!rounded-full hover:!bg-accent-100 hover:!text-accent-500"
      @click="emit('viewMore')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxProjectVulnerabilityTable from './vulnerability-table.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import {
  VULNERABILITY_API_SERVICE,
  type VulnerabilitiesQueryParams,
} from '~/components/modules/project/services/vulnerability.api.service';

const props = withDefaults(
  defineProps<{
    params: VulnerabilitiesQueryParams;
    showViewMore?: boolean;
  }>(),
  {
    showViewMore: true,
  },
);

const queryParams = computed(() => props.params);

const { data, error, isFetching } = VULNERABILITY_API_SERVICE.fetchRecentVulnerabilities(queryParams);

const emit = defineEmits<{
  (e: 'viewMore'): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRecentVulnerabilities',
};
</script>
