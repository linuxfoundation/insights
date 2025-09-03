<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="displayArchivedReposNote"
    class="w-full text-center flex items-center justify-center gap-1.5 bg-neutral-50 py-3 px-2 rounded-b-lg"
  >
    <lfx-icon
      name="info-circle"
      :size="14"
      class="text-neutral-500"
    />
    <span class="text-neutral-500 text-xs">
      <span class="font-semibold">Archived repositories</span> are excluded from
      {{ pageContent === 'health-score' ? 'Health Score and Security & Best practices' : 'Security & Best practices'}}.
    </span>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { useProjectStore } from "~/components/modules/project/store/project.store";

defineProps<{
  pageContent: 'health-score' | 'security'
}>()

const {
  archivedRepos,
  allArchived,
} = storeToRefs(useProjectStore())

const displayArchivedReposNote = computed(() => !!archivedRepos.value.length && !allArchived.value)

</script>

<script lang="ts">
export default {
    name: 'LfxReposExclusionFooter'
}
</script>
