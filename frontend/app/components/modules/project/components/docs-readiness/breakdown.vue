<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section
    v-if="props.categories.length"
    aria-labelledby="docs-readiness-breakdown-title"
  >
    <div class="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1.5 mb-2">
      <h3
        id="docs-readiness-breakdown-title"
        class="text-base font-secondary font-semibold"
      >
        {{ DOCS_READINESS_BREAKDOWN_TITLE }}
      </h3>
      <span class="text-xs text-neutral-500">{{ DOCS_READINESS_BREAKDOWN_SUBTITLE }}</span>
    </div>
    <lfx-accordion v-model="open">
      <lfx-project-docs-readiness-breakdown-category
        v-for="category in props.categories"
        :key="category.key"
        :category="category"
      />
    </lfx-accordion>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import LfxProjectDocsReadinessBreakdownCategory from '~/components/modules/project/components/docs-readiness/breakdown-category.vue';
import {
  DOCS_READINESS_BREAKDOWN_SUBTITLE,
  DOCS_READINESS_BREAKDOWN_TITLE,
} from '~/components/modules/project/config/docs-readiness-checks';
import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
import type { DocsReadinessCategory } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  categories: DocsReadinessCategory[];
}>();

const open = ref(props.categories[0]?.key ?? '');
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessBreakdown',
};
</script>
