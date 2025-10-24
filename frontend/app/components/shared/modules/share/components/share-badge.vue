<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-8">
    <p class="text-body-2 text-neutral-500 pb-8">
      Copy and paste your badges directly into your project's GitHub README file, providing instant insight into the
      state of your project.
    </p>

    <div class="flex flex-col gap-6">
      <lfx-share-badge-item
        v-if="!isRepoSelected"
        type="health-score"
        title="LFX Health Score"
        @copied="emit('copied')"
      />
      <lfx-share-badge-item
        v-if="!isRepoSelected"
        type="contributors"
        title="LFX Contributors"
        @copied="emit('copied')"
      />
      <div class="flex flex-col gap-1.5">
        <lfx-share-badge-item
          type="active-contributors"
          title="LFX Active Contributors"
          @copied="emit('copied')"
        />
        <span class="text-xs text-neutral-400 italic">*Active contributors over the past 365 days</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import LfxShareBadgeItem from '~/components/shared/modules/share/components/share-badge-item.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const emit = defineEmits<{ (e: 'copied'): void }>();

const { selectedRepositories } = storeToRefs(useProjectStore());
const isRepoSelected = computed(() => selectedRepositories.value.length > 0);
</script>

<script lang="ts">
export default {
  name: 'LfxShareBadge',
};
</script>
