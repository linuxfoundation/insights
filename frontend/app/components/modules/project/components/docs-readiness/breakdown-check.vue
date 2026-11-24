<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <li class="bg-neutral-50 rounded-lg px-3 py-2.5">
    <div class="flex flex-wrap items-start gap-x-3 gap-y-1.5">
      <span
        class="flex-none w-[8.25rem] text-xs font-semibold"
        :class="status.class"
        data-test="status"
      >
        {{ status.label }}
      </span>
      <div class="flex-[1_1_300px] min-w-0">
        <p
          class="text-body-1 font-semibold text-neutral-900 [overflow-wrap:anywhere]"
          data-test="title"
        >
          {{ title }}
        </p>
        <p
          class="text-[13px] text-neutral-600 [overflow-wrap:anywhere]"
          data-test="result"
        >
          {{ result }}
        </p>
        <p
          v-if="fix"
          class="mt-1 text-[13px] text-neutral-900 [overflow-wrap:anywhere]"
          data-test="fix"
        >
          <strong class="font-semibold">How to fix:</strong> {{ fix }}
        </p>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  DOCS_READINESS_CHECK_STATUS,
  docsReadinessCheckFix,
  docsReadinessCheckResult,
  docsReadinessCheckTitle,
} from '~/components/modules/project/config/docs-readiness-checks';
import type { DocsReadinessCheck } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  check: DocsReadinessCheck;
}>();

const status = computed(() => DOCS_READINESS_CHECK_STATUS[props.check.status]);
const title = computed(() => docsReadinessCheckTitle(props.check.id));
const result = computed(() => docsReadinessCheckResult(props.check));
const fix = computed(() => docsReadinessCheckFix(props.check));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessBreakdownCheck',
};
</script>
