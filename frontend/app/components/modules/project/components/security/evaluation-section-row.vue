<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="py-4 sm:py-5 border-t first:border-t-0 border-neutral-200 flex gap-10 items-center">
    <lfx-project-security-evaluation-section
      :title="title"
      :checks="checks"
      :tooltip="tooltip"
    />

    <div>
      <lfx-button
        type="tertiary"
        button-style="pill"
        size="small"
        class="whitespace-nowrap !font-semibold"
        @click="openReposEvalModal"
      >
        Repository breakdown
      </lfx-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import LfxProjectSecurityEvaluationSection from '~/components/modules/project/components/security/evaluation-section.vue';
import type { SecurityData } from '~~/types/security/responses.types';
import LfxButton from '~/components/uikit/button/button.vue';

const emit = defineEmits<{ (e: 'openReposEvalModal', category: string | undefined): void }>();

const props = defineProps<{
  checks: SecurityData[];
  title: string;
  tooltip?: string;
}>();

const category = computed(() => props.checks[0]?.category);

const openReposEvalModal = () => {
  emit('openReposEvalModal', category.value);
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationSection',
};
</script>
