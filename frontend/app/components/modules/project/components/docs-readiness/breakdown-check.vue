<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <li class="bg-neutral-50 rounded-lg px-3 py-2.5">
    <div class="flex flex-wrap items-start gap-x-3 gap-y-1.5">
      <span
        class="flex-none w-[8.25rem] flex items-center gap-1.5 text-xs font-semibold"
        :class="status.class"
        data-test="status"
      >
        <lfx-icon
          :name="status.icon"
          type="solid"
          :size="14"
          class="shrink-0"
          aria-hidden="true"
        />
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
        <p
          v-if="detailsOpen"
          :id="detailsId"
          class="mt-1.5 text-xs text-neutral-500 [overflow-wrap:anywhere]"
          data-test="details"
        >
          Check ID
          <code class="text-xs bg-neutral-200 px-1.5 py-px rounded-sm">{{ props.check.id }}</code
          >{{ testedLine }}
        </p>
      </div>
      <lfx-button
        type="transparent"
        size="small"
        class="flex-none !p-1 !text-xs"
        :aria-expanded="detailsOpen"
        :aria-controls="detailsOpen ? detailsId : undefined"
        @click="detailsOpen = !detailsOpen"
      >
        {{ detailsOpen ? 'Hide details' : 'Details' }}
      </lfx-button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';

import {
  DOCS_READINESS_CHECK_STATUS,
  docsReadinessCheckFix,
  docsReadinessCheckResult,
  docsReadinessCheckTitle,
  docsReadinessTestedLine,
} from '~/components/modules/project/config/docs-readiness-checks';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { DocsReadinessCheck } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  check: DocsReadinessCheck;
}>();

const detailsOpen = ref(false);
const detailsId = useId();

const status = computed(() => DOCS_READINESS_CHECK_STATUS[props.check.status]);
const title = computed(() => docsReadinessCheckTitle(props.check.id));
const result = computed(() => docsReadinessCheckResult(props.check));
const fix = computed(() => docsReadinessCheckFix(props.check));
const testedLine = computed(() => docsReadinessTestedLine(props.check));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessBreakdownCheck',
};
</script>
