<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-accordion-item
    :name="title"
    class="py-4 sm:py-5 border-t first:border-t-0 border-neutral-100"
  >
    <lfx-project-security-evaluation-section
      :title="title"
      :checks="checks"
      :tooltip="tooltip"
    />

    <template #content>
      <div class="border border-neutral-200 rounded-md px-4 sm:px-5 mt-4">
        <slot />
      </div>
    </template>
  </lfx-accordion-item>
</template>
<script setup lang="ts">
import LfxProjectSecurityEvaluationSection from '~/components/modules/project/components/security/evaluation-section.vue';
import type { SecurityData } from '~~/types/security/responses.types';
import LfxAccordionItem from '~/components/uikit/accordion/accordion-item.vue';

defineProps<{
  checks: SecurityData[];
  title: string;
  tooltip?: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationSection',
};
</script>
